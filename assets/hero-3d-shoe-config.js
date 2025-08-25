// Hero 3D Shoe Configuration
// Use this file to easily configure your custom 3D models

const HERO_3D_SHOE_CONFIG = {
  // ========================================
  // BASIC CONFIGURATION
  // ========================================
  
  // Set to true to use custom 3D model, false for built-in geometries
  useCustomModel: true,
  
  // Path to your 3D model file (relative to your assets folder)
  customModelPath: '/assets/nike_air_zoom_pegasus_36.glb',
  
  // Cutting method for the 3D model:
  // - 'none': Show full model with component highlighting
  // - 'bounds': Automatic cutting by height (Y-axis)
  // - 'names': Cut by named objects in your model
  // - 'materials': Cut by material groups
  cuttingMethod: 'none',
  
  // Custom step names (if different from default)
  // Default: ['sole', 'midsole', 'upper', 'laces', 'details']
  customSteps: ['sole', 'midsole', 'upper', 'laces', 'details'],
  
  // ========================================
  // ADVANCED CONFIGURATION
  // ========================================
  
  // Model scale (adjust if your model is too big/small)
  modelScale: 1.0,
  
  // Model rotation (in radians)
  modelRotation: {
    x: 0,
    y: 0,
    z: 0
  },
  
  // Model position offset
  modelPosition: {
    x: 0,
    y: 0,
    z: 0
  },
  
  // Custom cutting bounds (if using 'bounds' method)
  // Values are percentages of model height (0.0 to 1.0)
  customCuttingBounds: {
    sole: { minY: 0.0, maxY: 0.25 },      // Bottom 25% - rubber outsole
    midsole: { minY: 0.25, maxY: 0.45 },  // 25-45% - foam midsole
    upper: { minY: 0.45, maxY: 0.7 },     // 45-70% - mesh upper
    laces: { minY: 0.65, maxY: 0.8 },     // 65-80% - lacing system
    details: { minY: 0.7, maxY: 1.0 }     // 70-100% - logos and details
  },
  
  // Material mapping (if using 'materials' method)
  materialMapping: {
    'sole_material': 'sole',
    'midsole_material': 'midsole',
    'upper_material': 'upper',
    'laces_material': 'laces',
    'details_material': 'details'
  },
  
  // Object name mapping (if using 'names' method)
  objectNameMapping: {
    'Sole': 'sole',
    'Midsole': 'midsole',
    'Upper': 'upper',
    'Laces': 'laces',
    'Details': 'details'
  }
};

// ========================================
// QUICK SETUP EXAMPLES
// ========================================

// Example 1: Use a GLB model with automatic cutting
const EXAMPLE_GLB_CONFIG = {
  useCustomModel: true,
  customModelPath: '/assets/models/sneaker.glb',
  cuttingMethod: 'bounds'
};

// Example 2: Use an OBJ model with named parts
const EXAMPLE_OBJ_CONFIG = {
  useCustomModel: true,
  customModelPath: '/assets/models/shoe.obj',
  cuttingMethod: 'names',
  customSteps: ['base', 'body', 'top', 'accessories']
};

// Example 3: Use an FBX model with material groups
const EXAMPLE_FBX_CONFIG = {
  useCustomModel: true,
  customModelPath: '/assets/models/athletic-shoe.fbx',
  cuttingMethod: 'materials'
};

// ========================================
// USAGE INSTRUCTIONS
// ========================================

/*
TO USE YOUR OWN 3D MODEL:

1. Place your 3D model file in your assets folder
2. Update the configuration above:
   - Set useCustomModel: true
   - Set customModelPath to your model file path
   - Choose appropriate cuttingMethod

3. Supported file formats:
   - GLB/GLTF (recommended - most efficient)
   - OBJ (universal but larger)
   - FBX (good for animations)
   - DAE (Collada format)

4. For best results:
   - Use GLB format
   - Keep file size under 5MB
   - Model should be centered at origin (0,0,0)
   - Model should be oriented upright (Y-axis up)

5. Cutting methods explained:
   - bounds: Automatically cuts model into 5 parts by height
   - names: Cuts by named objects in your model (e.g., "sole", "upper")
   - materials: Cuts by material groups (e.g., "sole_material", "upper_material")

6. If cutting doesn't work as expected:
   - Check browser console for errors
   - Try different cutting method
   - Adjust customCuttingBounds for manual control
   - Ensure model has proper structure and materials
*/
