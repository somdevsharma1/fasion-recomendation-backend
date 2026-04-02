# ============================================================
# 🚀 FASHION RECOMMENDATION SYSTEM - Flask Backend
# FILE: app.py
# WHAT IT DOES:
#   - Receives image from React frontend
#   - Extracts features using ResNet50
#   - Finds 5 most similar images using NearestNeighbors
#   - Returns image URLs back to React
# ============================================================

# --- IMPORTS ---
from flask import Flask, request, jsonify  # Flask = web framework
from flask_cors import CORS                # CORS = allows React to talk to Flask
import numpy as np                         # numpy = math/array operations
import pickle                              # pickle = load saved .pkl files
import os                                  # os = file path operations
from PIL import Image                      # PIL = open/resize images
import io                                  # io = handle file bytes in memory

import tensorflow as tf
from tensorflow.keras.applications.resnet50 import ResNet50, preprocess_input
from tensorflow.keras.preprocessing import image as keras_image
from sklearn.neighbors import NearestNeighbors  # find similar images

# ============================================================
# 1. CREATE FLASK APP
# ============================================================
app = Flask(__name__)

# CORS: allows your React app (localhost:5173)
# to send requests to this Flask server (localhost:5000)
# Without this → browser blocks the request!
CORS(app)

# ============================================================
# 2. LOAD AI MODEL + SAVED DATA
# This runs ONCE when server starts (not on every request)
# ============================================================
print("⏳ Loading ResNet50 model...")
# include_top=False → remove classification layer
# pooling='avg'     → output is flat 2048 numbers
model = ResNet50(weights='imagenet', include_top=False, pooling='avg')
print("✅ Model loaded!")

print("⏳ Loading saved embeddings...")
# Load the feature fingerprints we saved in the notebook
feature_list = np.array(pickle.load(open('embeddings.pkl', 'rb')))
# Load the list of image file paths
filenames    = pickle.load(open('filenames.pkl', 'rb'))
print(f"✅ Loaded {len(filenames)} image embeddings!")

# ============================================================
# 3. SETUP NEAREST NEIGHBORS
# This is the algorithm that finds similar images
# algorithm='brute' → compare against ALL images (most accurate)
# metric='euclidean' → measure distance between fingerprints
# ============================================================
neighbors = NearestNeighbors(n_neighbors=6, algorithm='brute', metric='euclidean')
neighbors.fit(feature_list)  # "learn" all the fingerprints
print("✅ NearestNeighbors ready!")

# ============================================================
# 4. FEATURE EXTRACTION FUNCTION
# Same as notebook — converts image to 2048 numbers
# ============================================================
def extract_features_from_image(img):
    """
    INPUT:  PIL Image object
    OUTPUT: numpy array of 2048 numbers (the image's fingerprint)
    """
    # Resize to 224x224 (ResNet50 requirement)
    img = img.resize((224, 224))

    # Convert to RGB (in case image is RGBA or grayscale)
    img = img.convert('RGB')

    # Convert image to numpy array of pixel values
    img_array = keras_image.img_to_array(img)

    # Add batch dimension: shape (224,224,3) → (1,224,224,3)
    # ResNet expects batches, even if it's just 1 image
    expanded_img = np.expand_dims(img_array, axis=0)

    # Normalize pixel values for ResNet50
    preprocessed_img = preprocess_input(expanded_img)

    # Run through model → get 2048 feature numbers
    features = model.predict(preprocessed_img, verbose=0)

    # Flatten: shape (1, 2048) → (2048,)
    return features.flatten()

# ============================================================
# 5. API ROUTE: /recommend
# This is the endpoint React will call
# METHOD: POST (because we're sending image data)
# ============================================================
@app.route('/recommend', methods=['POST'])
def recommend():
    """
    RECEIVES: image file from React
    RETURNS:  JSON with 5 similar image paths
    """

    # --- Check if image was sent ---
    if 'image' not in request.files:
        # 400 = Bad Request
        return jsonify({'error': 'No image provided'}), 400

    # Get the uploaded file from React
    file = request.files['image']

    # Check file is not empty
    if file.filename == '':
        return jsonify({'error': 'Empty file'}), 400

    try:
        # Read image bytes from the uploaded file
        img_bytes = file.read()

        # Convert bytes to PIL Image object
        img = Image.open(io.BytesIO(img_bytes))

        # Extract 2048-number fingerprint from uploaded image
        uploaded_features = extract_features_from_image(img)

        # Find 6 nearest neighbors (1st result is the image itself)
        # distances = how different each match is
        # indices   = position in our feature_list array
        distances, indices = neighbors.kneighbors([uploaded_features])

        # Build list of recommended image paths
        # Skip index 0 → that's the uploaded image itself
        # Take indices 1-5 → the 5 most similar images
        recommended = []
        for i in indices[0][1:6]:   # [1:6] = skip first, take next 5
            # Convert file path to URL format
            # e.g. "fashion-product-images-small/images/1234.jpg"
            #   → "/images/1234.jpg"
            img_path = filenames[i]
            img_filename = os.path.basename(img_path)  # get just "1234.jpg"
            recommended.append({
                'image_url': f'/images/{img_filename}',
                'filename': img_filename,
            })

        # Return JSON response to React
        return jsonify({
            'success': True,
            'recommendations': recommended
        })

    except Exception as e:
        # If anything goes wrong, return error message
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500


# ============================================================
# 6. SERVE FASHION IMAGES
# React needs to display the recommended images
# This route serves images from the dataset folder
# ============================================================
@app.route('/images/<filename>')
def serve_image(filename):
    """Serves fashion product images to React frontend"""
    from flask import send_from_directory
    img_dir = 'fashion-product-images-small/images'
    return send_from_directory(img_dir, filename)


# ============================================================
# 7. HEALTH CHECK ROUTE
# React can call this to check if backend is running
# ============================================================
@app.route('/health')
def health():
    return jsonify({
        'status': 'running',
        'model': 'ResNet50',
        'total_images': len(filenames)
    })


# ============================================================
# 8. START SERVER
# ============================================================
if __name__ == '__main__':
    print("\n🚀 Fashion Recommendation API running!")
    print("📡 URL: http://localhost:5000")
    print("🔗 Health check: http://localhost:5000/health\n")
    # debug=True → auto-restart when you edit code
    app.run(debug=True, port=5000)
