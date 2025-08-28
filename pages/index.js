import React, { useState, useRef, useEffect } from 'react';
import { Download, Type, Palette, Underline, Upload, X } from 'lucide-react';

const TextImageGenerator = () => {
  const [text, setText] = useState('Hello World!');
  const [fontSize, setFontSize] = useState(48);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [textColor, setTextColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [isUnderlined, setIsUnderlined] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [customFonts, setCustomFonts] = useState([]);
  const [fontLoading, setFontLoading] = useState(false);
  
  const canvasRef = useRef(null);
  
  const fontOptions = [
    'Arial', 'Georgia', 'Times New Roman', 'Helvetica', 'Verdana', 
    'Courier New', 'Impact', 'Comic Sans MS', 'Trebuchet MS', 'Palatino'
  ];

  const handleFontUpload = async (event) => {
    const files = Array.from(event.target.files);
    setFontLoading(true);

    for (let file of files) {
      if (file.type.includes('font') || file.name.match(/\.(ttf|otf|woff|woff2)$/i)) {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const fontName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
          
          // Create a new FontFace
          const fontFace = new FontFace(fontName, arrayBuffer);
          await fontFace.load();
          
          // Add to document fonts
          document.fonts.add(fontFace);
          
          // Add to custom fonts list
          setCustomFonts(prev => [...prev, { name: fontName, file: file.name }]);
        } catch (error) {
          console.error('Error loading font:', error);
          alert(`Failed to load font: ${file.name}`);
        }
      } else {
        alert(`Invalid font file: ${file.name}. Please upload TTF, OTF, WOFF, or WOFF2 files.`);
      }
    }
    
    setFontLoading(false);
    // Reset file input
    event.target.value = '';
  };

  const removeFontFromList = (fontName) => {
    setCustomFonts(prev => prev.filter(font => font.name !== fontName));
    // Reset font family if the removed font was selected
    if (fontFamily === fontName) {
      setFontFamily('Arial');
    }
  };
  
  const colorPresets = [
    '#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', 
    '#ff00ff', '#00ffff', '#ffa500', '#800080', '#ffc0cb'
  ];

  const generateImage = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 800;
    canvas.height = 400;
    
    // Fill background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Set text properties
    let fontString = '';
    if (isItalic) fontString += 'italic ';
    if (isBold) fontString += 'bold ';
    fontString += `${fontSize}px ${fontFamily}`;
    
    ctx.font = fontString;
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw text
    const x = canvas.width / 2;
    const y = canvas.height / 2;
    ctx.fillText(text, x, y);
    
    // Add underline if enabled
    if (isUnderlined) {
      const textMetrics = ctx.measureText(text);
      const textWidth = textMetrics.width;
      const underlineY = y + fontSize * 0.1;
      
      ctx.strokeStyle = textColor;
      ctx.lineWidth = Math.max(1, fontSize / 20);
      ctx.beginPath();
      ctx.moveTo(x - textWidth / 2, underlineY);
      ctx.lineTo(x + textWidth / 2, underlineY);
      ctx.stroke();
    }
  };
  
  const downloadImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'generated-text-image.png';
    link.href = canvas.toDataURL();
    link.click();
  };
  
  useEffect(() => {
    generateImage();
  }, [text, fontSize, fontFamily, textColor, backgroundColor, isUnderlined, isBold, isItalic]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Text to Image Generator
        </h1>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Controls Panel */}
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
            <h2 className="text-2xl font-semibold text-gray-700 flex items-center gap-2">
              <Type className="w-6 h-6" />
              Text Settings
            </h2>
            
            {/* Font Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Upload Custom Fonts
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  multiple
                  accept=".ttf,.otf,.woff,.woff2"
                  onChange={handleFontUpload}
                  className="hidden"
                  id="font-upload"
                />
                <label
                  htmlFor="font-upload"
                  className="cursor-pointer flex flex-col items-center gap-2 text-gray-500 hover:text-gray-700"
                >
                  <Upload className="w-8 h-8" />
                  <span className="text-sm">
                    {fontLoading ? 'Loading fonts...' : 'Click to upload TTF, OTF, WOFF, WOFF2 files'}
                  </span>
                </label>
              </div>
              
              {customFonts.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-2">Uploaded Fonts:</p>
                  <div className="space-y-1">
                    {customFonts.map((font, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded text-sm">
                        <span className="font-medium" style={{fontFamily: font.name}}>
                          {font.name}
                        </span>
                        <button
                          onClick={() => removeFontFromList(font.name)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Your Text
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Enter your text here..."
              />
            </div>
            
            {/* Text Input */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Your Text
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Enter your text here..."
              />
            </div>
            
            {/* Font Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Font Family
                </label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <optgroup label="System Fonts">
                    {fontOptions.map(font => (
                      <option key={font} value={font} style={{fontFamily: font}}>
                        {font}
                      </option>
                    ))}
                  </optgroup>
                  {customFonts.length > 0 && (
                    <optgroup label="Custom Fonts">
                      {customFonts.map(font => (
                        <option key={font.name} value={font.name} style={{fontFamily: font.name}}>
                          {font.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Font Size: {fontSize}px
                </label>
                <input
                  type="range"
                  min="12"
                  max="120"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
            
            {/* Text Style Options */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-3">
                Text Style
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBold}
                    onChange={(e) => setIsBold(e.target.checked)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="font-bold">Bold</span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isItalic}
                    onChange={(e) => setIsItalic(e.target.checked)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="italic">Italic</span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isUnderlined}
                    onChange={(e) => setIsUnderlined(e.target.checked)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="underline flex items-center gap-1">
                    <Underline className="w-4 h-4" />
                    Underline
                  </span>
                </label>
              </div>
            </div>
            
            {/* Color Settings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-4">
                <Palette className="w-5 h-5" />
                Colors
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Text Color
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {colorPresets.map(color => (
                      <button
                        key={color}
                        onClick={() => setTextColor(color)}
                        className="w-6 h-6 rounded border-2 border-gray-300"
                        style={{backgroundColor: color}}
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Background Color
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {['#ffffff', '#f0f0f0', '#e0e0e0', '#d0d0d0', '#c0c0c0', '#a0a0a0', '#808080', '#606060', '#404040', '#202020'].map(color => (
                      <button
                        key={color}
                        onClick={() => setBackgroundColor(color)}
                        className="w-6 h-6 rounded border-2 border-gray-300"
                        style={{backgroundColor: color}}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Download Button */}
            <button
              onClick={downloadImage}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:scale-105"
            >
              <Download className="w-5 h-5" />
              Download Image
            </button>
          </div>
          
          {/* Preview Panel */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Preview
            </h2>
            <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
              <canvas
                ref={canvasRef}
                className="w-full h-auto max-w-full"
                style={{ maxHeight: '400px' }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2 text-center">
              Image Size: 800 × 400 pixels
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextImageGenerator;