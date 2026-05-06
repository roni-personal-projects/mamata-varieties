import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { generateProductDescription, recognizeProductColor, generateProductTitle, analyzeProductImage } from '../../lib/gemini';
import { removeBackground } from '@imgly/background-removal';
import { 
  Upload, 
  Trash2, 
  Sparkles, 
  Image as ImageIcon, 
  Plus, 
  Check, 
  Loader2,
  X,
  Palette,
  Type,
  Pen
} from 'lucide-react';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  
  // Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Sunglasses',
    description: ''
  });
  const [selectedImages, setSelectedImages] = useState([]); // Array of { file, preview, color, id }
  const [editingProduct, setEditingProduct] = useState(null); // Holds product being edited

  const categories = ["Sunglasses", "Watches", "Perfumes", "Caps", "Waist Belts"];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*, variants(*)');
    
    if (error) console.error('Error fetching products:', error);
    else setProducts(data || []);
    setLoading(false);
  };

  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files);
    const newImgs = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      color: 'Detecting...',
      processing: true,
      id: Math.random().toString(36).substr(2, 9)
    }));
    
    setSelectedImages([...selectedImages, ...newImgs]);
    
    // Auto-detect colors for each new image with a large delay to respect the 5 RPM limit
    newImgs.forEach(async (img, index) => {
      setTimeout(async () => {
        const color = await recognizeProductColor(img.file);
        setSelectedImages(prev => prev.map(p => p.id === img.id ? { ...p, color, processing: false } : p));
      }, index * 13000); // 13s stagger to stay under 5 RPM (60s / 5 = 12s)
    });
  };

  const removeBg = async (imgId) => {
    const img = selectedImages.find(i => i.id === imgId);
    if (!img) return;

    setSelectedImages(prev => prev.map(p => p.id === imgId ? { ...p, processing: true } : p));
    
    try {
      const blob = await removeBackground(img.file);
      const newFile = new File([blob], `no-bg-${img.file.name}`, { type: 'image/png' });
      setSelectedImages(prev => prev.map(p => p.id === imgId ? { 
        ...p, 
        file: newFile, 
        preview: URL.createObjectURL(newFile),
        processing: false 
      } : p));
    } catch (error) {
      console.error("BG Removal failed:", error);
      setSelectedImages(prev => prev.map(p => p.id === imgId ? { ...p, processing: false } : p));
    }
  };

  const generateDesc = async () => {
    if (selectedImages.length === 0 || !newProduct.name) return;
    setUploading(true);
    const desc = await generateProductDescription(selectedImages[0].file, newProduct.name);
    setNewProduct({ ...newProduct, description: desc });
    setUploading(false);
  };

  const saveProduct = async () => {
    if (!newProduct.name || selectedImages.length === 0) return;
    setUploading(true);

    try {
      // 1. Insert Product
      const { data: productData, error: productError } = await supabase
        .from('products')
        .insert([newProduct])
        .select()
        .single();

      if (productError) throw productError;

      // 2. Upload Variants
      for (const img of selectedImages) {
        const fileExt = img.file.name.split('.').pop();
        const fileName = `${productData.id}/${Math.random()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, img.file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        await supabase.from('variants').insert([{
          product_id: productData.id,
          color: img.color,
          image_url: publicUrl
        }]);
      }

      // Cleanup
      setShowAddProduct(false);
      setNewProduct({ name: '', category: 'Sunglasses', description: '' });
      setSelectedImages([]);
      fetchProducts();
    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  const updateProduct = async () => {
    if (!editingProduct) return;
    setUploading(true);
    try {
      // Update product details
      const { error: prodError } = await supabase
        .from('products')
        .update({
          name: newProduct.name,
          category: newProduct.category,
          description: newProduct.description
        })
        .eq('id', editingProduct.id);
      if (prodError) throw prodError;

      // Upload any new variant images (same logic as saveProduct)
      for (const img of selectedImages.filter(img => img.file)) {
        const fileExt = img.file.name.split('.').pop();
        const fileName = `${editingProduct.id}/${Math.random()}.${fileExt}`;
        const filePath = `products/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, img.file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);
        await supabase.from('variants').insert([{ product_id: editingProduct.id, color: img.color, image_url: publicUrl }]);
      }

      // Cleanup
      setShowAddProduct(false);
      setEditingProduct(null);
      setNewProduct({ name: '', category: 'Sunglasses', description: '' });
      setSelectedImages([]);
      fetchProducts();
    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  const startEdit = (product) => {
    setEditingProduct(product);
    setNewProduct({ name: product.name, category: product.category, description: product.description });
    setSelectedImages(product.variants.map(v => ({
      preview: v.image_url,
      color: v.color,
      id: v.id,
      existing: true
    })));
    setShowAddProduct(true);
  };

  const deleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) console.error(error);
    else fetchProducts();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-background p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-dark/10 pb-8 gap-6">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">Admin <span className="text-accent italic font-drama lowercase">Panel.</span></h1>
            <p className="text-dark/40 font-mono text-xs uppercase mt-2">Manage Mamta Varieties Catalog</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLogout}
              className="px-6 py-3 rounded-full font-bold uppercase text-xs tracking-widest text-dark/40 hover:text-red-500 transition-colors"
            >
              Sign Out
            </button>
            <button 
              onClick={() => setShowAddProduct(true)}
              className="bg-dark text-primary px-6 py-3 rounded-full font-bold uppercase text-xs tracking-widest flex items-center gap-2 hover:bg-accent transition-colors"
            >
              <Plus size={16} /> New Product
            </button>
          </div>
        </header>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={product.id} className="bg-white border border-dark/5 p-6 rounded-[2rem] shadow-sm flex flex-col gap-4">
              <div className="aspect-square rounded-2xl overflow-hidden bg-dark/5">
                {product.variants?.[0] && (
                  <img src={product.variants[0].image_url} alt={product.name} className="w-full h-full object-cover" />
                )}
              </div>
              <div>
                <span className="text-[10px] font-mono text-accent uppercase tracking-widest">{product.category}</span>
                <h3 className="text-xl font-black uppercase tracking-tight">{product.name}</h3>
                <p className="text-xs text-dark/60 mt-1 line-clamp-2">{product.description}</p>
              </div>
              <div className="flex justify-between items-center mt-auto pt-4 border-t border-dark/5">
                <span className="text-[10px] font-mono text-dark/30 uppercase">{product.variants?.length} Colors</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => startEdit(product)}
                    className="text-accent hover:bg-accent/10 p-2 rounded-full transition-colors"
                    title="Edit Product"
                  >
                    <Pen size={18} />
                  </button>
                  <button 
                    onClick={() => deleteProduct(product.id)}
                    className="text-red-500 hover:bg-red-10 p-2 rounded-full transition-colors"
                    title="Delete Product"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Product Modal */}
        {showAddProduct && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-dark/40 backdrop-blur-md">
            <div className="bg-white w-full max-w-4xl max-h-[90dvh] overflow-y-auto rounded-[3rem] p-8 md:p-12 shadow-2xl flex flex-col gap-8">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black uppercase tracking-tighter">
                  {editingProduct ? 'Edit' : 'Add'} <span className="text-accent italic font-drama lowercase">Collection.</span>
                </h2>
                <div className="flex items-center gap-4">
                  {!editingProduct && selectedImages.length > 0 && (
                    <button
                      onClick={async () => {
                        setUploading(true);
                        const data = await analyzeProductImage(selectedImages[0].file);
                        setNewProduct(prev => ({ 
                          ...prev, 
                          name: data.title, 
                          description: data.description 
                        }));
                        
                        // Detect colors for all images with a delay to stay under 5 RPM
                        selectedImages.forEach(async (img, idx) => {
                          setTimeout(async () => {
                            const color = await recognizeProductColor(img.file);
                            setSelectedImages(prev => prev.map(p => p.id === img.id ? { ...p, color, processing: false } : p));
                          }, idx * 13000); // 13s stagger
                        });
                        
                        setUploading(false);
                      }}
                      disabled={uploading}
                      className="flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-accent hover:text-white transition-all"
                    >
                      {uploading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                      Magic Fill
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setShowAddProduct(false);
                      setEditingProduct(null);
                      setNewProduct({ name: '', category: 'Sunglasses', description: '' });
                      setSelectedImages([]);
                    }} 
                    className="p-2 hover:bg-dark/5 rounded-full transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-12">
                {/* Left: Info */}
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-mono uppercase text-dark/40 ml-4">Product Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Classic Wayfarer"
                      className="bg-dark/5 border-none p-4 rounded-2xl font-sans font-bold"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    />
                    <button
                      onClick={async () => {
                        if (selectedImages.length === 0) return;
                        const title = await generateProductTitle(selectedImages[0].file);
                        setNewProduct(prev => ({ ...prev, name: title }));
                      }}
                      disabled={uploading || selectedImages.length === 0}
                      className="ml-2 px-4 py-2 bg-accent text-white rounded-full hover:scale-105 transition-transform"
                    >
                      Generate Title
                    </button>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-mono uppercase text-dark/40 ml-4">Category</label>
                    <select 
                      className="bg-dark/5 border-none p-4 rounded-2xl font-sans font-bold appearance-none"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2 relative">
                    <label className="text-[10px] font-mono uppercase text-dark/40 ml-4">Description</label>
                    <textarea 
                      placeholder="Product details..."
                      rows={4}
                      className="bg-dark/5 border-none p-4 rounded-2xl font-sans text-sm"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    />
                    <button 
                      onClick={generateDesc}
                      disabled={uploading || selectedImages.length === 0}
                      className="absolute bottom-4 right-4 bg-accent text-white p-2 rounded-xl hover:scale-110 transition-transform disabled:opacity-50"
                      title="Generate with Gemini"
                    >
                      <Sparkles size={18} />
                    </button>
                  </div>
                </div>

                {/* Right: Variants */}
                <div className="flex flex-col gap-6">
                  <label className="text-[10px] font-mono uppercase text-dark/40 ml-4">Color Variants</label>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {selectedImages.map((img, i) => (
                      <div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden group bg-dark/5 border border-dark/10">
                        <img src={img.preview} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-dark/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                          <button 
                            onClick={() => removeBg(img.id)}
                            className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg backdrop-blur-md flex items-center gap-2 text-[10px] uppercase font-bold w-full justify-center"
                          >
                            <ImageIcon size={14} /> Clear BG
                          </button>
                          <button 
                            onClick={() => setSelectedImages(selectedImages.filter(p => p.id !== img.id))}
                            className="bg-red-500/20 hover:bg-red-500/40 text-red-200 p-2 rounded-lg backdrop-blur-md flex items-center gap-2 text-[10px] uppercase font-bold w-full justify-center"
                          >
                            <X size={14} /> Remove
                          </button>
                        </div>
                        <div className="absolute bottom-2 left-2 right-2">
                          <input 
                            className="w-full bg-white/80 backdrop-blur-md border-none px-2 py-1 rounded text-[10px] font-bold text-dark text-center"
                            value={img.color}
                            onChange={(e) => {
                              const newImgs = [...selectedImages];
                              newImgs[i].color = e.target.value;
                              setSelectedImages(newImgs);
                            }}
                          />
                        </div>
                        {img.processing && (
                          <div className="absolute inset-0 bg-dark/40 backdrop-blur-[2px] flex items-center justify-center">
                            <Loader2 className="animate-spin text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                    
                    <label className="aspect-square rounded-2xl border-2 border-dashed border-dark/10 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-accent hover:bg-accent/5 transition-all">
                      <Plus className="text-dark/20" />
                      <span className="text-[10px] font-mono uppercase text-dark/30">Add Image</span>
                      <input type="file" multiple className="hidden" onChange={handleImageSelect} accept="image/*" />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-4">
                <button 
                  onClick={() => {
                    setShowAddProduct(false);
                    setEditingProduct(null);
                    setNewProduct({ name: '', category: 'Sunglasses', description: '' });
                    setSelectedImages([]);
                  }}
                  className="px-8 py-4 rounded-full font-bold uppercase text-xs tracking-widest text-dark/40 hover:text-dark transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={editingProduct ? updateProduct : saveProduct}
                  disabled={uploading || !newProduct.name || selectedImages.length === 0}
                  className="bg-accent text-white px-12 py-4 rounded-full font-bold uppercase text-xs tracking-widest shadow-lg shadow-accent/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {uploading ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                  {uploading ? 'Processing...' : editingProduct ? 'Save Changes' : 'Publish Product'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
