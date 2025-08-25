# 🎯 How to Use Custom 3D Models in Your Shopify Theme

## **📋 Quick Start Guide**

### **Step 1: Prepare Your 3D Model**
1. **Export your model** in one of these formats:
   - **GLB/GLTF** (recommended - most efficient)
   - **OBJ** (universal but larger)
   - **FBX** (good for animations)
   - **DAE** (Collada format)

2. **Model requirements**:
   - Keep file size under **5MB** for web performance
   - Center model at origin **(0,0,0)**
   - Orient model upright **(Y-axis up)**
   - Use descriptive material names if possible

### **Step 2: Add Your Model to Shopify**
1. **Upload your 3D model** to your Shopify theme's `assets` folder
2. **Create a models subfolder**: `assets/models/`
3. **Place your file**: `assets/models/your-shoe.glb`

### **Step 3: Configure the System**
1. **Open** `assets/hero-3d-shoe-config.js`
2. **Update the configuration**:
   ```javascript
   const HERO_3D_SHOE_CONFIG = {
     useCustomModel: true,                    // Enable custom model
     customModelPath: '/assets/models/your-shoe.glb',  // Your model path
     cuttingMethod: 'bounds'                  // Cutting method
   };
   ```

## **🔧 Three Cutting Methods**

### **Method 1: Automatic Cutting by Height (bounds)**
- **Best for**: Models without named parts
- **How it works**: Automatically cuts model into 5 parts by Y-axis height
- **Configuration**:
  ```javascript
  cuttingMethod: 'bounds'
  ```

### **Method 2: Cut by Named Objects (names)**
- **Best for**: Models with properly named parts
- **How it works**: Uses object names like "sole", "upper", "laces"
- **Configuration**:
  ```javascript
  cuttingMethod: 'names',
  customSteps: ['base', 'body', 'top', 'accessories']
  ```

### **Method 3: Cut by Material Groups (materials)**
- **Best for**: Models with different materials for each part
- **How it works**: Groups by material names like "sole_material", "upper_material"
- **Configuration**:
  ```javascript
  cuttingMethod: 'materials'
  ```

## **📁 File Structure**
```
your-shopify-theme/
├── assets/
│   ├── models/
│   │   ├── your-shoe.glb          # Your 3D model
│   │   └── another-model.obj      # Another model
│   ├── hero-3d-shoe-config.js     # Configuration file
│   ├── hero-3d-shoe.js           # Main JavaScript
│   └── hero-3d-shoe.css          # Styles
└── layout/
    └── theme.liquid               # Theme layout
```

## **🎨 Advanced Configuration Options**

### **Custom Cutting Bounds**
```javascript
customCuttingBounds: {
  sole: { minY: 0.0, maxY: 0.2 },      // Bottom 20%
  midsole: { minY: 0.2, maxY: 0.4 },   // 20-40%
  upper: { minY: 0.4, maxY: 0.7 },     // 40-70%
  laces: { minY: 0.6, maxY: 0.8 },     // 60-80%
  details: { minY: 0.7, maxY: 1.0 }    // Top 30%
}
```

### **Model Transformations**
```javascript
modelScale: 1.0,                    // Scale factor
modelRotation: { x: 0, y: 0, z: 0 }, // Rotation in radians
modelPosition: { x: 0, y: 0, z: 0 }   // Position offset
```

### **Custom Step Names**
```javascript
customSteps: ['base', 'body', 'top', 'accessories', 'final']
```

## **🚀 Example Configurations**

### **Example 1: Simple GLB Model**
```javascript
const HERO_3D_SHOE_CONFIG = {
  useCustomModel: true,
  customModelPath: '/assets/models/sneaker.glb',
  cuttingMethod: 'bounds'
};
```

### **Example 2: Named Parts Model**
```javascript
const HERO_3D_SHOE_CONFIG = {
  useCustomModel: true,
  customModelPath: '/assets/models/shoe.obj',
  cuttingMethod: 'names',
  customSteps: ['base', 'body', 'top', 'accessories']
};
```

### **Example 3: Material-Based Model**
```javascript
const HERO_3D_SHOE_CONFIG = {
  useCustomModel: true,
  customModelPath: '/assets/models/athletic-shoe.fbx',
  cuttingMethod: 'materials'
};
```

## **🔍 Troubleshooting**

### **Model Not Loading?**
- Check file path in `customModelPath`
- Ensure file is uploaded to `assets/models/`
- Check browser console for errors
- Verify file format is supported

### **Cutting Not Working?**
- Try different `cuttingMethod`
- Check if model has proper structure
- Adjust `customCuttingBounds` manually
- Ensure model is properly oriented

### **Performance Issues?**
- Reduce model file size (under 5MB)
- Use GLB format for best performance
- Simplify model geometry
- Check mobile device performance

## **💡 Pro Tips**

1. **Start with GLB format** - it's the most efficient
2. **Test on mobile** - ensure good performance
3. **Use descriptive names** - makes debugging easier
4. **Keep models simple** - complex models can cause issues
5. **Backup your work** - before making major changes

## **🎯 What Happens During Assembly**

1. **Model Loading**: Your 3D model loads from the specified path
2. **Automatic Cutting**: System cuts model into assemblable parts
3. **Part Management**: Each part is managed separately for animation
4. **Scroll Assembly**: Parts assemble as user scrolls down
5. **Completion**: Full model is displayed with celebration effects

## **🔄 Switching Between Models**

To switch between different models:
1. **Update** `customModelPath` in the config file
2. **Choose appropriate** `cuttingMethod`
3. **Adjust** `customCuttingBounds` if needed
4. **Refresh** your Shopify theme

## **📱 Mobile Optimization**

The system automatically:
- **Reduces quality** on mobile devices
- **Disables shadows** for better performance
- **Simplifies animations** on small screens
- **Optimizes loading** for mobile networks

---

**Need Help?** Check the browser console for error messages and ensure your 3D model meets the requirements listed above.
