// Hero 3D Shoe Assembly Animation
class Hero3DShoe {
  constructor(options = {}) {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.shoeParts = {};
    this.currentStep = 0;
    this.steps = ['sole', 'midsole', 'upper', 'laces', 'details'];
    this.isAnimating = false;
    this.animationProgress = 0;
    
    // Custom model configuration
    this.useCustomModel = options.useCustomModel || false;
    this.customModelPath = options.customModelPath || '';
    this.cuttingMethod = options.cuttingMethod || 'bounds'; // 'bounds', 'names', 'materials'
    this.customSteps = options.customSteps || this.steps;
    this.customCuttingBounds = options.customCuttingBounds || {};
    this.modelScale = options.modelScale || 1.0;
    this.modelRotation = options.modelRotation || { x: 0, y: 0, z: 0 };
    this.modelPosition = options.modelPosition || { x: 0, y: 0, z: 0 };
    
    // Override steps if custom steps provided
    if (this.customSteps.length > 0) {
      this.steps = this.customSteps;
    }
    
    this.init();
  }

  async init() {
    await this.setupThreeJS();
    await this.createShoeParts();
    this.setupEventListeners();
    this.startAnimation();
  }

  async setupThreeJS() {
    this.updateLoadingText('Setting up 3D scene...');
    this.updateProgressBar(10);
    
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f0f23);

    this.updateLoadingText('Configuring camera...');
    this.updateProgressBar(25);
    // Create camera
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    this.camera.position.set(0, 1, 3);

    this.updateLoadingText('Initializing renderer...');
    this.updateProgressBar(40);
    // Create renderer with mobile optimizations
    const canvas = document.getElementById('shoe-canvas');
    const isMobile = window.innerWidth <= 768;
    
    this.renderer = new THREE.WebGLRenderer({ 
      canvas: canvas,
      antialias: !isMobile, // Disable antialiasing on mobile for performance
      alpha: true,
      powerPreference: "high-performance",
      stencil: false, // Disable stencil buffer for performance
      depth: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Optimize pixel ratio for mobile
    const pixelRatio = isMobile ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 2);
    this.renderer.setPixelRatio(pixelRatio);
    
    // Optimize shadow settings for mobile
    this.renderer.shadowMap.enabled = !isMobile; // Disable shadows on mobile for performance
    if (!isMobile) {
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.shadowMap.autoUpdate = false; // Disable auto-update for performance
    }

    this.updateLoadingText('Adding lighting...');
    this.updateProgressBar(55);
    // Add lights
    this.setupLighting();

    this.updateLoadingText('Creating ground plane...');
    this.updateProgressBar(70);
    // Add ground plane
    this.addGroundPlane();

    // Handle resize
    window.addEventListener('resize', () => this.onWindowResize());
    
    this.updateLoadingText('3D environment ready!');
    this.updateProgressBar(85);
  }

  setupLighting() {
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    this.scene.add(ambientLight);

    // Main directional light (sun-like)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(3, 4, 3);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 10;
    directionalLight.shadow.camera.left = -3;
    directionalLight.shadow.camera.right = 3;
    directionalLight.shadow.camera.top = 3;
    directionalLight.shadow.camera.bottom = -3;
    this.scene.add(directionalLight);

    // Fill light (softer, from opposite side)
    const fillLight = new THREE.DirectionalLight(0x4facfe, 0.6);
    fillLight.position.set(-3, 2, -2);
    this.scene.add(fillLight);

    // Rim light for dramatic edge highlighting
    const rimLight = new THREE.DirectionalLight(0x00d4ff, 0.4);
    rimLight.position.set(-2, 1, -3);
    this.scene.add(rimLight);

    // Top light for shoe details
    const topLight = new THREE.PointLight(0xffffff, 0.8, 8);
    topLight.position.set(0, 4, 0);
    this.scene.add(topLight);

    // Subtle fog for depth and atmosphere
    this.scene.fog = new THREE.Fog(0x0f0f23, 4, 12);
  }

  addGroundPlane() {
    // Main ground plane
    const groundGeometry = new THREE.PlaneGeometry(12, 12);
    const groundMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x1a1a2e,
      transparent: true,
      opacity: 0.4
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1;
    ground.receiveShadow = true;
    this.scene.add(ground);
    
    // Reflective surface (subtle mirror effect)
    const reflectiveGeometry = new THREE.PlaneGeometry(8, 8);
    const reflectiveMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x2a2a4a,
      transparent: true,
      opacity: 0.2
    });
    const reflective = new THREE.Mesh(reflectiveGeometry, reflectiveMaterial);
    reflective.rotation.x = -Math.PI / 2;
    reflective.position.y = -0.99;
    this.scene.add(reflective);
    
    // Ground texture pattern (subtle grid)
    for (let i = 0; i < 5; i++) {
      const lineGeometry = new THREE.BoxGeometry(10, 0.01, 0.01);
      const lineMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x2a2a4a,
        transparent: true,
        opacity: 0.1
      });
      
      const horizontalLine = new THREE.Mesh(lineGeometry, lineMaterial);
      horizontalLine.position.set(0, -0.98, -2 + i * 1);
      this.scene.add(horizontalLine);
      
      const verticalLine = new THREE.Mesh(lineGeometry, lineMaterial);
      verticalLine.rotation.z = Math.PI / 2;
      verticalLine.position.set(-2 + i * 1, -0.98, 0);
      this.scene.add(verticalLine);
    }
  }

  async createShoeParts() {
    // Show loading screen while creating parts
    this.showLoadingScreen();
    
    // Add timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.warn('Loading timeout reached, showing fallback content');
      this.updateLoadingText('Loading taking longer than expected...');
      this.updateTimeoutMessage('Please wait, this is normal for first-time loading');
    }, 10000); // 10 second timeout
    
    try {
      if (this.useCustomModel && this.customModelPath) {
        await this.loadCustomModel();
      } else {
        await this.createBuiltInShoeParts();
      }

      // Initially hide all parts
      Object.values(this.shoeParts).forEach(part => {
        part.visible = false;
        part.scale.set(0, 0, 0);
        
        // Optimize for mobile performance
        if (window.innerWidth <= 768) {
          part.castShadow = false;
          part.receiveShadow = false;
        }
      });
      
      console.log('Shoe parts created:', Object.keys(this.shoeParts));
      
      // Clear timeout and hide loading screen
      clearTimeout(loadingTimeout);
      this.hideLoadingScreen();
      
    } catch (error) {
      console.error('Error creating shoe parts:', error);
      clearTimeout(loadingTimeout);
      this.updateLoadingText('Error loading shoe. Please refresh the page.');
      
      // Hide loading screen after error message
      setTimeout(() => {
        this.hideLoadingScreen();
      }, 3000);
    }
  }

  // Load custom 3D model from file
  async loadCustomModel() {
    try {
      // Choose your model format and loader
      const loader = this.getModelLoader();
      const model = await loader.loadAsync(this.customModelPath);
      
      // Process the loaded model
      this.processLoadedModel(model);
      
    } catch (error) {
      console.error('Error loading 3D model:', error);
      // Fallback to built-in parts
      await this.createBuiltInShoeParts();
    }
  }

  // Get appropriate loader based on file extension
  getModelLoader() {
    const extension = this.customModelPath.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'glb':
      case 'gltf':
        return new THREE.GLTFLoader();
      case 'obj':
        return new THREE.OBJLoader();
      case 'fbx':
        return new THREE.FBXLoader();
      case 'dae':
        return new THREE.ColladaLoader();
      default:
        throw new Error(`Unsupported file format: ${extension}`);
    }
  }

  // Process loaded model and cut into parts
  processLoadedModel(model) {
    const modelScene = model.scene || model;
    
    // Apply model transformations from config
    this.applyModelTransformations(modelScene);
    
    // Use the selected cutting method
    switch (this.cuttingMethod) {
      case 'none':
        this.showFullModelWithHighlighting(modelScene);
        break;
      case 'bounds':
        this.cutModelByBounds(modelScene);
        break;
      case 'names':
        this.cutModelByNames(modelScene);
        break;
      case 'materials':
        this.cutModelByMaterials(modelScene);
        break;
      default:
        this.showFullModelWithHighlighting(modelScene); // fallback
    }
  }

  // Apply model transformations from configuration
  applyModelTransformations(modelScene) {
    // Apply scale
    if (this.modelScale && this.modelScale !== 1.0) {
      modelScene.scale.set(this.modelScale, this.modelScale, this.modelScale);
    }
    
    // Apply rotation
    if (this.modelRotation) {
      if (this.modelRotation.x !== 0) modelScene.rotation.x = this.modelRotation.x;
      if (this.modelRotation.y !== 0) modelScene.rotation.y = this.modelRotation.y;
      if (this.modelRotation.z !== 0) modelScene.rotation.z = this.modelRotation.z;
    }
    
    // Apply position offset
    if (this.modelPosition) {
      if (this.modelPosition.x !== 0) modelScene.position.x = this.modelPosition.x;
      if (this.modelPosition.y !== 0) modelScene.position.y = this.modelPosition.y;
      if (this.modelPosition.z !== 0) modelScene.position.z = this.modelPosition.z;
    }
  }

  // Show full model with component highlighting (no cutting)
  showFullModelWithHighlighting(modelScene) {
    // Add the full model to the scene
    this.shoeParts.fullModel = modelScene;
    this.scene.add(modelScene);
    
    // Create invisible highlight overlays for each component
    this.createComponentHighlights(modelScene);
    
    // Initially show the full model
    modelScene.visible = true;
    modelScene.scale.set(1, 1, 1);
    
    console.log('Full model loaded with component highlighting');
  }

  // Create invisible highlight overlays for component navigation
  createComponentHighlights(modelScene) {
    // Calculate model bounds for positioning highlights
    const box = new THREE.Box3().setFromObject(modelScene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    
    // Create highlight zones for each component
    const highlightZones = {
      sole: { minY: center.y - size.y * 0.5, maxY: center.y - size.y * 0.25, color: 0xff0000 },
      midsole: { minY: center.y - size.y * 0.25, maxY: center.y, color: 0x00ff00 },
      upper: { minY: center.y, maxY: center.y + size.y * 0.25, color: 0x0000ff },
      laces: { minY: center.y + size.y * 0.15, maxY: center.y + size.y * 0.35, color: 0xffff00 },
      details: { minY: center.y + size.y * 0.25, maxY: center.y + size.y * 0.5, color: 0xff00ff }
    };
    
    // Store highlight zones for later use
    this.highlightZones = highlightZones;
    
    // Create invisible highlight boxes (for debugging, can be removed)
    Object.entries(highlightZones).forEach(([componentName, zone]) => {
      const highlightGeometry = new THREE.BoxGeometry(size.x, zone.maxY - zone.minY, size.z);
      const highlightMaterial = new THREE.MeshBasicMaterial({ 
        color: zone.color, 
        transparent: true, 
        opacity: 0.0, // Invisible
        wireframe: false
      });
      
      const highlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
      highlight.position.set(center.x, (zone.minY + zone.maxY) / 2, center.z);
      highlight.userData = { componentName, zone };
      
      // Store highlight for later use
      if (!this.shoeParts.highlights) this.shoeParts.highlights = [];
      this.shoeParts.highlights.push(highlight);
      this.scene.add(highlight);
    });
  }

  // Cut model into parts based on geometry bounds
  cutModelByBounds(modelScene) {
    // Calculate model bounds
    const box = new THREE.Box3().setFromObject(modelScene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    
    // Use custom cutting bounds from config if available, otherwise use defaults
    const customBounds = this.customCuttingBounds || {};
    const defaultCuts = {
      sole: { minY: center.y - size.y * 0.4, maxY: center.y - size.y * 0.1 },
      midsole: { minY: center.y - size.y * 0.1, maxY: center.y + size.y * 0.1 },
      upper: { minY: center.y + size.y * 0.1, maxY: center.y + size.y * 0.4 },
      laces: { minY: center.y + size.y * 0.2, maxY: center.y + size.y * 0.5 },
      details: { minY: center.y + size.y * 0.1, maxY: center.y + size.y * 0.6 }
    };
    
    // Define cutting planes for different parts
    const cuts = {};
    this.steps.forEach(stepName => {
      if (customBounds[stepName]) {
        // Use custom bounds (percentages converted to actual Y positions)
        const minY = center.y - size.y * 0.5 + size.y * customBounds[stepName].minY;
        const maxY = center.y - size.y * 0.5 + size.y * customBounds[stepName].maxY;
        cuts[stepName] = { minY, maxY };
      } else {
        // Use default bounds
        cuts[stepName] = defaultCuts[stepName] || defaultCuts.sole;
      }
    });
    
    // Create parts by cutting the model
    Object.entries(cuts).forEach(([partName, bounds]) => {
      this.shoeParts[partName] = this.cutModelPart(modelScene, bounds, partName);
      this.scene.add(this.shoeParts[partName]);
    });
  }

  // Cut a specific part from the model
  cutModelPart(modelScene, bounds, partName) {
    const partGroup = new THREE.Group();
    
    // Clone the model and apply cutting
    modelScene.traverse((child) => {
      if (child.isMesh) {
        const clonedMesh = child.clone();
        
        // Apply cutting based on Y position
        if (clonedMesh.position.y >= bounds.minY && clonedMesh.position.y <= bounds.maxY) {
          // Scale and position the part appropriately
          clonedMesh.scale.set(1, 1, 1);
          clonedMesh.position.y -= bounds.minY; // Normalize position
          
          // Add to part group
          partGroup.add(clonedMesh);
        }
      }
    });
    
    // Position the part group
    partGroup.position.y = bounds.minY;
    
    return partGroup;
  }

  // Cut model by named objects (if your model has named parts)
  cutModelByNames(modelScene) {
    const namedParts = {};
    
    modelScene.traverse((child) => {
      if (child.name && this.steps.includes(child.name.toLowerCase())) {
        const partName = child.name.toLowerCase();
        namedParts[partName] = child.clone();
        this.shoeParts[partName] = namedParts[partName];
        this.scene.add(this.shoeParts[partName]);
      }
    });
    
    // Fill missing parts with built-in geometries
    this.steps.forEach(stepName => {
      if (!this.shoeParts[stepName]) {
        console.log(`Creating built-in part for: ${stepName}`);
        this.createBuiltInPart(stepName);
      }
    });
  }

  // Cut model by material groups
  cutModelByMaterials(modelScene) {
    const materialGroups = {};
    
    modelScene.traverse((child) => {
      if (child.isMesh && child.material) {
        const materialName = child.material.name || 'default';
        if (!materialGroups[materialName]) {
          materialGroups[materialName] = new THREE.Group();
        }
        materialGroups[materialName].add(child.clone());
      }
    });
    
    // Map material groups to shoe parts
    const materialMapping = {
      'sole': 'sole',
      'midsole': 'midsole',
      'upper': 'upper',
      'laces': 'laces',
      'details': 'details'
    };
    
    Object.entries(materialMapping).forEach(([materialName, partName]) => {
      if (materialGroups[materialName]) {
        this.shoeParts[partName] = materialGroups[materialName];
        this.scene.add(this.shoeParts[partName]);
      }
    });
  }

  // Create built-in parts (fallback)
  async createBuiltInShoeParts() {
    this.updateLoadingText('Creating shoe components...');
    this.updateProgressBar(90);
    
    // Create sole
    this.updateLoadingText('Building sole...');
    this.updateProgressBar(92);
    const soleGeometry = new THREE.BoxGeometry(1.2, 0.1, 0.4);
    const soleMaterial = new THREE.MeshLambertMaterial({ color: 0x2c3e50 });
    this.shoeParts.sole = new THREE.Mesh(soleGeometry, soleMaterial);
    this.shoeParts.sole.position.y = -0.05;
    this.shoeParts.sole.castShadow = true;
    this.shoeParts.sole.receiveShadow = true;
    this.scene.add(this.shoeParts.sole);

    // Create midsole
    this.updateLoadingText('Adding midsole...');
    this.updateProgressBar(94);
    const midsoleGeometry = new THREE.BoxGeometry(1.1, 0.15, 0.35);
    const midsoleMaterial = new THREE.MeshLambertMaterial({ color: 0xecf0f1 });
    this.shoeParts.midsole = new THREE.Mesh(midsoleGeometry, midsoleMaterial);
    this.shoeParts.midsole.position.y = 0.05;
    this.shoeParts.midsole.castShadow = true;
    this.shoeParts.midsole.receiveShadow = true;
    this.scene.add(this.shoeParts.midsole);

    // Create upper
    this.updateLoadingText('Crafting upper...');
    this.updateProgressBar(96);
    const upperGeometry = new THREE.BoxGeometry(1.0, 0.3, 0.3);
    const upperMaterial = new THREE.MeshLambertMaterial({ color: 0x3498db });
    this.shoeParts.upper = new THREE.Mesh(upperGeometry, upperMaterial);
    this.shoeParts.upper.position.y = 0.275;
    this.shoeParts.upper.castShadow = true;
    this.shoeParts.upper.receiveShadow = true;
    this.scene.add(this.shoeParts.upper);

    // Create laces
    this.updateLoadingText('Adding laces...');
    this.updateProgressBar(98);
    const lacesGeometry = new THREE.BoxGeometry(0.8, 0.05, 0.25);
    const lacesMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    this.shoeParts.laces = new THREE.Mesh(lacesGeometry, lacesMaterial);
    this.shoeParts.laces.position.y = 0.425;
    this.shoeParts.laces.castShadow = true;
    this.shoeParts.laces.receiveShadow = true;
    this.scene.add(this.shoeParts.laces);

    // Create details
    this.updateLoadingText('Adding final details...');
    this.updateProgressBar(99);
    const detailsGeometry = new THREE.BoxGeometry(0.3, 0.05, 0.2);
    const detailsMaterial = new THREE.MeshLambertMaterial({ color: 0xe74c3c });
    this.shoeParts.details = new THREE.Mesh(detailsGeometry, detailsMaterial);
    this.shoeParts.details.position.set(0.35, 0.5, 0);
    this.shoeParts.details.castShadow = true;
    this.shoeParts.details.receiveShadow = true;
    this.scene.add(this.shoeParts.details);

    this.updateLoadingText('Shoe components ready!');
    this.updateProgressBar(100);
  }

  // Create individual built-in part
  createBuiltInPart(partName) {
    switch (partName) {
      case 'sole':
        this.createSole();
        break;
      case 'midsole':
        this.createMidsole();
        break;
      case 'upper':
        this.createUpper();
        break;
      case 'laces':
        this.createLaces();
        break;
      case 'details':
        this.createDetails();
        break;
    }
  }

  async createSole() {
    // Create a realistic shoe sole with proper shape
    const soleGroup = new THREE.Group();
    
    // Main sole base (curved and tapered)
    const baseGeometry = new THREE.BoxGeometry(2.2, 0.25, 0.9);
    const baseMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x1a1a1a,
      roughness: 0.8
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.set(0, -0.5, 0);
    base.castShadow = true;
    base.receiveShadow = true;
    soleGroup.add(base);
    
    // Toe area (slightly wider)
    const toeGeometry = new THREE.BoxGeometry(2.4, 0.2, 0.85);
    const toeMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x2c2c2c,
      roughness: 0.9
    });
    const toe = new THREE.Mesh(toeGeometry, toeMaterial);
    toe.position.set(0.1, -0.45, 0);
    toe.castShadow = true;
    soleGroup.add(toe);
    
    // Heel area (thicker and rounded)
    const heelGeometry = new THREE.CylinderGeometry(0.4, 0.35, 0.3, 8);
    const heelMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x1a1a1a,
      roughness: 0.8
    });
    const heel = new THREE.Mesh(heelGeometry, heelMaterial);
    heel.position.set(-0.6, -0.35, 0);
    heel.rotation.x = Math.PI / 2;
    heel.castShadow = true;
    soleGroup.add(heel);
    
    // Tread pattern (simple grooves)
    for (let i = 0; i < 5; i++) {
      const treadGeometry = new THREE.BoxGeometry(2.1, 0.05, 0.1);
      const treadMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x0f0f0f,
        roughness: 1.0
      });
      const tread = new THREE.Mesh(treadGeometry, treadMaterial);
      tread.position.set(0, -0.52, -0.3 + i * 0.15);
      soleGroup.add(tread);
    }
    
    this.shoeParts.sole = soleGroup;
    this.scene.add(soleGroup);
  }

  async createMidsole() {
    const midsoleGroup = new THREE.Group();
    
    // Main midsole (white foam-like material)
    const mainGeometry = new THREE.BoxGeometry(1.9, 0.35, 0.75);
    const mainMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xf8f8f8,
      roughness: 0.3
    });
    const main = new THREE.Mesh(mainGeometry, mainMaterial);
    main.position.set(0, -0.2, 0);
    main.castShadow = true;
    main.receiveShadow = true;
    midsoleGroup.add(main);
    
    // Air unit/bubble (slightly transparent)
    const airGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const airMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xe0f0ff,
      transparent: true,
      opacity: 0.7,
      roughness: 0.1
    });
    const air = new THREE.Mesh(airGeometry, airMaterial);
    air.position.set(0.3, -0.15, 0.2);
    midsoleGroup.add(air);
    
    // Side panels (textured)
    const sideGeometry = new THREE.BoxGeometry(0.1, 0.3, 0.7);
    const sideMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xe8e8e8,
      roughness: 0.6
    });
    
    const leftSide = new THREE.Mesh(sideGeometry, sideMaterial);
    leftSide.position.set(-0.9, -0.2, 0);
    midsoleGroup.add(leftSide);
    
    const rightSide = new THREE.Mesh(sideGeometry, sideMaterial);
    rightSide.position.set(0.9, -0.2, 0);
    midsoleGroup.add(rightSide);
    
    this.shoeParts.midsole = midsoleGroup;
    this.scene.add(midsoleGroup);
  }

  async createUpper() {
    const upperGroup = new THREE.Group();
    
    // Main upper body (sneaker shape)
    const bodyGeometry = new THREE.BoxGeometry(1.7, 0.7, 0.65);
    const bodyMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x2a2a2a,
      roughness: 0.7
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.set(0, 0.3, 0);
    body.castShadow = true;
    body.receiveShadow = true;
    upperGroup.add(body);
    
    // Toe cap (rounded front)
    const toeCapGeometry = new THREE.BoxGeometry(1.8, 0.6, 0.6);
    const toeCapMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x1a1a1a,
      roughness: 0.8
    });
    const toeCap = new THREE.Mesh(toeCapGeometry, toeCapMaterial);
    toeCap.position.set(0.2, 0.3, 0);
    upperGroup.add(toeCap);
    
    // Heel counter (back support)
    const heelGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.1);
    const heelMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x1a1a1a,
      roughness: 0.8
    });
    const heel = new THREE.Mesh(heelGeometry, heelMaterial);
    heel.position.set(-0.6, 0.3, 0.25);
    upperGroup.add(heel);
    
    // Side panels (mesh-like texture)
    const sideGeometry = new THREE.BoxGeometry(0.05, 0.6, 0.6);
    const sideMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x3a3a3a,
      roughness: 0.9
    });
    
    const leftPanel = new THREE.Mesh(sideGeometry, sideMaterial);
    leftPanel.position.set(-0.8, 0.3, 0);
    upperGroup.add(leftPanel);
    
    const rightPanel = new THREE.Mesh(sideGeometry, sideMaterial);
    rightPanel.position.set(0.8, 0.3, 0);
    upperGroup.add(rightPanel);
    
    // Tongue area (slightly raised)
    const tongueGeometry = new THREE.BoxGeometry(1.2, 0.1, 0.5);
    const tongueMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x2a2a2a,
      roughness: 0.6
    });
    const tongue = new THREE.Mesh(tongueGeometry, tongueMaterial);
    tongue.position.set(0, 0.65, 0);
    upperGroup.add(tongue);
    
    this.shoeParts.upper = upperGroup;
    this.scene.add(upperGroup);
  }

  async createLaces() {
    const lacesGroup = new THREE.Group();
    
    // Create realistic laces with proper positioning
    const laceGeometry = new THREE.CylinderGeometry(0.015, 0.015, 0.35, 6);
    const laceMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xffffff,
      roughness: 0.4
    });
    
    // Horizontal laces (across the shoe)
    for (let i = 0; i < 4; i++) {
      const lace = new THREE.Mesh(laceGeometry, laceMaterial);
      lace.position.set(0, 0.35 + i * 0.12, 0.25);
      lace.rotation.x = Math.PI / 2;
      lace.castShadow = true;
      lacesGroup.add(lace);
    }
    
    // Vertical lace ends (hanging down)
    const endGeometry = new THREE.CylinderGeometry(0.015, 0.015, 0.2, 6);
    
    // Left side lace ends
    for (let i = 0; i < 2; i++) {
      const end = new THREE.Mesh(endGeometry, laceMaterial);
      end.position.set(-0.3, 0.35 + i * 0.12, 0.25);
      end.castShadow = true;
      lacesGroup.add(end);
    }
    
    // Right side lace ends
    for (let i = 0; i < 2; i++) {
      const end = new THREE.Mesh(endGeometry, laceMaterial);
      end.position.set(0.3, 0.35 + i * 0.12, 0.25);
      end.castShadow = true;
      lacesGroup.add(end);
    }
    
    // Lace aglets (metal tips)
    const agletGeometry = new THREE.CylinderGeometry(0.02, 0.015, 0.03, 6);
    const agletMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xc0c0c0,
      roughness: 0.2
    });
    
    // Add aglets to lace ends
    for (let i = 0; i < 4; i++) {
      const aglet = new THREE.Mesh(agletGeometry, agletMaterial);
      aglet.position.set(-0.3 + (i % 2) * 0.6, 0.35 + Math.floor(i / 2) * 0.12, 0.15);
      lacesGroup.add(aglet);
    }
    
    this.shoeParts.laces = lacesGroup;
    this.scene.add(lacesGroup);
  }

  async createDetails() {
    const detailsGroup = new THREE.Group();
    
    // Brand logo (circular badge)
    const logoGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.02, 8);
    const logoMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x4facfe,
      roughness: 0.3
    });
    const logo = new THREE.Mesh(logoGeometry, logoMaterial);
    logo.position.set(0.6, 0.3, 0.3);
    logo.rotation.x = Math.PI / 2;
    logo.castShadow = true;
    detailsGroup.add(logo);
    
    // Logo center (inner circle)
    const logoCenterGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.03, 8);
    const logoCenterMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xffffff,
      roughness: 0.2
    });
    const logoCenter = new THREE.Mesh(logoCenterGeometry, logoCenterMaterial);
    logoCenter.position.set(0.6, 0.3, 0.3);
    logoCenter.rotation.x = Math.PI / 2;
    detailsGroup.add(logoCenter);
    
    // Side swoosh (curved design element)
    const swooshGeometry = new THREE.TorusGeometry(0.15, 0.02, 6, 16, Math.PI);
    const swooshMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x4facfe,
      roughness: 0.4
    });
    const swoosh = new THREE.Mesh(swooshGeometry, swooshMaterial);
    swoosh.position.set(0.7, 0.3, 0);
    swoosh.rotation.x = Math.PI / 2;
    swoosh.rotation.z = Math.PI / 4;
    detailsGroup.add(swoosh);
    
    // Heel tab (pull tab)
    const tabGeometry = new THREE.BoxGeometry(0.3, 0.15, 0.05);
    const tabMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x2a2a2a,
      roughness: 0.8
    });
    const tab = new THREE.Mesh(tabGeometry, tabMaterial);
    tab.position.set(-0.6, 0.6, 0.3);
    detailsGroup.add(tab);
    
    // Tab stitching (decorative lines)
    for (let i = 0; i < 3; i++) {
      const stitchGeometry = new THREE.BoxGeometry(0.25, 0.01, 0.06);
      const stitchMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x1a1a1a,
        roughness: 1.0
      });
      const stitch = new THREE.Mesh(stitchGeometry, stitchMaterial);
      stitch.position.set(-0.6, 0.6, 0.3 + (i - 1) * 0.02);
      detailsGroup.add(stitch);
    }
    
    // Eyelets (lace holes)
    const eyeletGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.05, 8);
    const eyeletMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x1a1a1a,
      roughness: 0.9
    });
    
    // Add eyelets on both sides
    for (let i = 0; i < 4; i++) {
      const leftEyelet = new THREE.Mesh(eyeletGeometry, eyeletMaterial);
      leftEyelet.position.set(-0.8, 0.35 + i * 0.12, 0.25);
      leftEyelet.rotation.x = Math.PI / 2;
      detailsGroup.add(leftEyelet);
      
      const rightEyelet = new THREE.Mesh(eyeletGeometry, eyeletMaterial);
      rightEyelet.position.set(0.8, 0.35 + i * 0.12, 0.25);
      rightEyelet.rotation.x = Math.PI / 2;
      detailsGroup.add(rightEyelet);
    }
    
    this.shoeParts.details = detailsGroup;
    this.scene.add(detailsGroup);
  }

  setupEventListeners() {
    // Scroll listener
    window.addEventListener('scroll', () => {
      this.handleScroll();
    });

    // Step click listeners - scroll to that step
    document.querySelectorAll('.step').forEach((step, index) => {
      step.addEventListener('click', () => {
        this.scrollToStep(index);
      });
    });

    // Replay button
    const replayBtn = document.getElementById('replay-btn');
    if (replayBtn) {
      replayBtn.addEventListener('click', () => {
        this.replayAnimation();
      });
    }

    // Mouse movement for camera rotation
    let mouseX = 0;
    let mouseY = 0;
    
    document.addEventListener('mousemove', (event) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    });
  }

  handleScroll() {
    const scrollTop = window.pageYOffset;
    const windowHeight = window.innerHeight;
    const sectionHeight = document.getElementById('hero-3d-shoe').offsetHeight;
    
    // Check if we're still within the hero section
    if (scrollTop < sectionHeight - windowHeight) {
      // Still in hero section - show 3D UI elements
      this.show3DUIElements();
      
      // Calculate progress within the hero section
      const progress = Math.max(0, Math.min(1, scrollTop / (sectionHeight - windowHeight)));
      
      // Update animation based on scroll
      this.updateAnimationProgress(progress);
    } else {
      // Left the hero section - hide 3D UI elements
      this.hide3DUIElements();
    }
  }

  updateAnimationProgress(progress) {
    if (this.isAnimating) return;
    
    // Calculate assembly progress (first 5/6 of the section)
    const assemblyProgress = Math.min(1, progress * 1.2); // 5/6 = 0.833, so multiply by 1.2
    const stepIndex = Math.floor(assemblyProgress * this.steps.length);
    const stepProgress = (assemblyProgress * this.steps.length) % 1;
    
    if (stepIndex !== this.currentStep) {
      this.currentStep = stepIndex;
      this.updateStepDisplay();
    }
    
    // Handle full model with component highlighting
    if (this.cuttingMethod === 'none' && this.shoeParts.fullModel) {
      this.handleFullModelAnimation(stepIndex, stepProgress);
    } else {
      // Handle cut parts based on scroll progress
      this.steps.forEach((stepName, index) => {
        const part = this.shoeParts[stepName];
        if (part) {
          if (index < stepIndex) {
            // Part is fully assembled
            part.visible = true;
            part.scale.set(1, 1, 1);
            part.particleEffectAdded = true;
          } else if (index === stepIndex) {
            // Part is being assembled
            part.visible = true;
            const scale = stepProgress;
            part.scale.set(scale, scale, scale);
            part.rotation.y = stepProgress * Math.PI * 2;
            
            if (stepProgress > 0.5 && !part.particleEffectAdded) {
              this.addParticleEffect(part.position);
              part.particleEffectAdded = true;
            }
          } else {
            // Part is not yet assembled
            part.visible = false;
            part.scale.set(0, 0, 0);
            part.particleEffectAdded = false;
          }
        }
      });
    }
    
    // Show completion celebration when shoe is fully assembled
    if (assemblyProgress >= 1) {
      this.showCompletionCelebration(progress);
    }
    
    this.updateProgressBar(progress);
  }

  // Handle full model animation with component highlighting
  handleFullModelAnimation(stepIndex, stepProgress) {
    const fullModel = this.shoeParts.fullModel;
    if (!fullModel) return;
    
    // Always show the full model
    fullModel.visible = true;
    fullModel.scale.set(1, 1, 1);
    
    // Highlight the current component being focused on
    this.highlightCurrentComponent(stepIndex, stepProgress);
    
    // Add rotation animation to the current component focus
    if (stepProgress > 0.5 && !fullModel.particleEffectAdded) {
      this.addParticleEffect(fullModel.position);
      fullModel.particleEffectAdded = true;
    }
  }

  // Highlight the current component being focused on
  highlightCurrentComponent(stepIndex, stepProgress) {
    if (!this.highlightZones || !this.shoeParts.highlights) return;
    
    const currentStepName = this.steps[stepIndex];
    const currentZone = this.highlightZones[currentStepName];
    
    // Reset all highlights
    this.shoeParts.highlights.forEach(highlight => {
      highlight.material.opacity = 0.0;
    });
    
    // Highlight current component with pulsing effect
    if (currentZone) {
      const currentHighlight = this.shoeParts.highlights.find(h => 
        h.userData.componentName === currentStepName
      );
      
      if (currentHighlight) {
        // Pulsing highlight effect
        const pulseOpacity = 0.3 + 0.2 * Math.sin(Date.now() * 0.01);
        currentHighlight.material.opacity = pulseOpacity;
      }
    }
  }

  updateStepDisplay() {
    document.querySelectorAll('.step').forEach((step, index) => {
      step.classList.remove('active', 'completed');
      
      if (index < this.currentStep) {
        step.classList.add('completed');
      } else if (index === this.currentStep) {
        step.classList.add('active');
      }
      
      // Update step content for component navigation
      if (this.cuttingMethod === 'none') {
        const stepContent = step.querySelector('.step-content');
        if (stepContent) {
          const componentNames = {
            sole: 'Sole',
            midsole: 'Midsole',
            upper: 'Upper',
            laces: 'Laces',
            details: 'Details'
          };
          stepContent.textContent = componentNames[this.steps[index]] || this.steps[index];
        }
      }
    });
  }



  addParticleEffect(position) {
    for (let i = 0; i < 10; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = (position.x + 0.5) * 100 + '%';
      particle.style.top = (position.y + 0.5) * 100 + '%';
      
      document.querySelector('.hero-3d-shoe__canvas-container').appendChild(particle);
      
      // Remove particle after animation
      setTimeout(() => {
        particle.remove();
      }, 3000);
    }
  }

  showCompletionCelebration(progress) {
    // Add celebration particles
    if (!this.celebrationStarted) {
      this.celebrationStarted = true;
      
      // Create celebration particles
      for (let i = 0; i < 50; i++) {
        setTimeout(() => {
          const particle = document.createElement('div');
          particle.className = 'celebration-particle';
          particle.style.left = Math.random() * 100 + '%';
          particle.style.top = Math.random() * 100 + '%';
          
          document.querySelector('.hero-3d-shoe__canvas-container').appendChild(particle);
          
          setTimeout(() => {
            particle.remove();
          }, 4000);
        }, i * 100);
      }
      
      // Update scroll indicator
      const scrollIndicator = document.querySelector('.scroll-indicator span');
      if (scrollIndicator) {
        scrollIndicator.textContent = 'Scroll to explore more';
      }
      
      // Update CTA button
      const exploreBtn = document.querySelector('.btn-primary');
      if (exploreBtn) {
        if (this.cuttingMethod === 'none') {
          exploreBtn.textContent = 'Explore Our Collection';
        } else {
          exploreBtn.textContent = 'Explore Our Collection';
        }
        exploreBtn.href = '#featured-collections';
      }
    }
  }

  hide3DUIElements() {
    // Hide all 3D UI elements when leaving the hero section
    const elementsToHide = [
      '.hero-3d-shoe__canvas-container',
      '.hero-3d-shoe__steps',
      '.hero-3d-shoe__progress',
      '.hero-3d-shoe__cta',
      '.scroll-indicator'
    ];
    
    elementsToHide.forEach(selector => {
      const element = document.querySelector(selector);
      if (element) {
        element.style.opacity = '0';
        element.style.pointerEvents = 'none';
      }
    });
  }

  show3DUIElements() {
    // Show all 3D UI elements when back in the hero section
    const elementsToShow = [
      '.hero-3d-shoe__canvas-container',
      '.hero-3d-shoe__steps',
      '.hero-3d-shoe__progress',
      '.hero-3d-shoe__cta',
      '.scroll-indicator'
    ];
    
    elementsToShow.forEach(selector => {
      const element = document.querySelector(selector);
      if (element) {
        element.style.opacity = '1';
        element.style.pointerEvents = 'auto';
      }
    });
  }

  updateProgressBar(progress) {
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    
    if (progressFill) {
      progressFill.style.width = `${progress}%`;
    }
    
    if (progressText) {
      const step = Math.ceil(progress / 20); // 5 steps total
      const stepNames = ['Initializing...', 'Setting up 3D...', 'Creating parts...', 'Finalizing...', 'Ready!'];
      progressText.textContent = stepNames[Math.min(step - 1, stepNames.length - 1)];
    }
  }

  scrollToStep(stepIndex) {
    const sectionHeight = document.getElementById('hero-3d-shoe').offsetHeight;
    const windowHeight = window.innerHeight;
    const stepProgress = stepIndex / this.steps.length;
    const targetScroll = stepProgress * (sectionHeight - windowHeight);
    
    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    });
  }



  replayAnimation() {
    // Scroll to top
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  startAnimation() {
    // Hide loading screen only when model is ready
    this.hideLoadingScreen();
    
    // Start render loop
    this.animate();
  }

  // Hide loading screen when model is ready
  hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      // Add a small delay to ensure smooth transition
      setTimeout(() => {
        loadingScreen.classList.add('hidden');
        // Remove from DOM after animation completes
        setTimeout(() => {
          if (loadingScreen.parentNode) {
            loadingScreen.parentNode.removeChild(loadingScreen);
          }
        }, 600);
      }, 500);
    }
  }

  // Show loading screen
  showLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.classList.remove('hidden');
      this.updateLoadingText('Initializing 3D environment...');
    }
  }

  // Update loading text to show progress
  updateLoadingText(text) {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      const textElement = loadingScreen.querySelector('p');
      if (textElement) {
        textElement.textContent = text;
      }
    }
  }

  // Update timeout message
  updateTimeoutMessage(message) {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      const timeoutElement = loadingScreen.querySelector('.loading-timeout');
      if (timeoutElement) {
        timeoutElement.textContent = message;
      }
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    
    const time = Date.now() * 0.001;
    const isMobile = window.innerWidth <= 768;
    
    // Enhanced camera movement to showcase shoe details
    if (!isMobile) {
      // Smooth orbital camera with slight vertical movement
      const radius = 3.5;
      const height = 1.2;
      this.camera.position.x = Math.sin(time * 0.4) * radius;
      this.camera.position.z = Math.cos(time * 0.4) * radius;
      this.camera.position.y = height + Math.sin(time * 0.8) * 0.3;
      
      // Look slightly above center for better shoe view
      this.camera.lookAt(0, 0.1, 0);
    } else {
      // Simplified movement for mobile
      const radius = 2.5;
      this.camera.position.x = Math.sin(time * 0.3) * radius;
      this.camera.position.z = Math.cos(time * 0.3) * radius;
      this.camera.position.y = 1;
      this.camera.lookAt(0, 0, 0);
    }
    
    // Subtle shoe part animations
    const rotationSpeed = isMobile ? 0.003 : 0.006;
    Object.values(this.shoeParts).forEach(part => {
      if (part.visible && part.type !== 'Group') {
        // Only rotate individual meshes, not groups
        if (part.geometry) {
          part.rotation.y += rotationSpeed;
        }
      }
    });
    
    // Add subtle floating animation to completed shoe
    if (this.currentStep >= this.steps.length - 1) {
      Object.values(this.shoeParts).forEach(part => {
        if (part.visible && part.type !== 'Group') {
          part.position.y += Math.sin(time * 2) * 0.001;
        }
      });
    }
    
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    const aspect = window.innerWidth / window.innerHeight;
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Re-optimize for mobile on resize
    const isMobile = window.innerWidth <= 768;
    const pixelRatio = isMobile ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 2);
    this.renderer.setPixelRatio(pixelRatio);
    
    // Update shadow settings
    this.renderer.shadowMap.enabled = !isMobile;
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Load Three.js from CDN
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  script.onload = () => {
    // Load additional loaders for custom models
    loadAdditionalLoaders().then(() => {
      // Load GSAP
      const gsapScript = document.createElement('script');
      gsapScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
      gsapScript.onload = () => {
        // Initialize with custom model (if specified)
        initializeHero3DShoe();
      };
      document.head.appendChild(gsapScript);
    });
  };
  document.head.appendChild(script);
});

// Load additional Three.js loaders for custom models
async function loadAdditionalLoaders() {
  const loaders = [
    { src: 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js', name: 'GLTFLoader' },
    { src: 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/OBJLoader.js', name: 'OBJLoader' },
    { src: 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/FBXLoader.js', name: 'FBXLoader' },
    { src: 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/ColladaLoader.js', name: 'ColladaLoader' }
  ];

  for (const loader of loaders) {
    await loadScript(loader.src);
  }
}

// Helper function to load scripts
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Initialize Hero3DShoe with custom options
function initializeHero3DShoe() {
  // Use configuration from hero-3d-shoe-config.js
  if (typeof HERO_3D_SHOE_CONFIG !== 'undefined') {
    new Hero3DShoe(HERO_3D_SHOE_CONFIG);
  } else {
    // Fallback to default configuration
    new Hero3DShoe();
  }
}
