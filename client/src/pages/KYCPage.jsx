import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { UploadCloud, CheckCircle, AlertTriangle, FileText, X, Camera } from 'lucide-react';

export default function KYCPage() {
  const { user } = useContext(AuthContext);
  const [kycStatus, setKycStatus] = useState('Unverified');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Selfie State
  const [selfieImage, setSelfieImage] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/kyc/status');
      setKycStatus(res.data.kycStatus);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    // Limit to 3 files
    if (selectedFiles.length + files.length > 3) {
      setMessage('You can only upload a maximum of 3 documents at once.');
      return;
    }
    setFiles([...files, ...selectedFiles]);
    setMessage('');
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      setMessage('Please select at least one document to upload.');
      return;
    }
    if (!selfieImage) {
      setMessage('Please capture a live selfie to prove your identity.');
      return;
    }

    setUploading(true);
    setMessage('');
    
    try {
      // Read all files as Base64 strings
      const base64Files = await Promise.all(
        files.map(file => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve({ name: file.name, data: reader.result });
            reader.onerror = error => reject(error);
          });
        })
      );

      // Append Live Selfie
      base64Files.push({ name: 'Live-Selfie-Verification.jpg', data: selfieImage });

      const res = await axios.post('http://localhost:5000/api/kyc/upload', { documents: base64Files }, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      setKycStatus(res.data.kycStatus);
      setFiles([]);
      setSelfieImage(null);
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
      setMessage('');
    } catch (err) {
      setMessage('Camera access denied or unavailable. Please check browser permissions.');
    }
  };

  const captureSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      // Draw the video frame to the canvas
      context.drawImage(videoRef.current, 0, 0, 320, 240);
      const dataUrl = canvasRef.current.toDataURL('image/jpeg');
      setSelfieImage(dataUrl);
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setIsCameraActive(false);
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h2>Identity Verification (KYC)</h2>
        <p className="text-muted">Secure your account by completing regulatory compliance.</p>
      </div>

      <div className="card" style={{ maxWidth: '700px', margin: '0 auto' }}>
        
        {/* Status Headers */}
        <div style={{ marginBottom: '2rem', padding: '1.5rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {kycStatus === 'Verified' && <CheckCircle size={32} color="var(--color-success)" />}
          {kycStatus === 'Rejected' && <AlertTriangle size={32} color="var(--color-danger)" />}
          {kycStatus === 'Pending' && <FileText size={32} color="var(--color-accent)" />}
          {kycStatus === 'Unverified' && <AlertTriangle size={32} color="var(--color-danger)" />}
          
          <div>
            <h3 style={{ margin: '0 0 0.25rem 0', color: 
              kycStatus === 'Verified' ? 'var(--color-success)' :
              kycStatus === 'Rejected' ? 'var(--color-danger)' :
              kycStatus === 'Pending' ? 'var(--color-accent)' : 'var(--color-danger)'
            }}>
              Status: {kycStatus}
            </h3>
            <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem' }}>
              {kycStatus === 'Verified' ? 'Your identity is fully verified. You have full access to all banking features.' :
               kycStatus === 'Pending' ? 'Your documents are currently under review by our compliance team. This typically takes 24 hours.' :
               kycStatus === 'Rejected' ? 'Your verification was rejected. Please re-upload clearer copies of your government-issued ID.' :
               'You must verify your identity before you can make large transfers or open new accounts.'}
            </p>
          </div>
        </div>

        {/* Upload Form - strictly visible if Unverified or Rejected */}
        {(kycStatus === 'Unverified' || kycStatus === 'Rejected') && (
          <form onSubmit={handleSubmit}>
            <div style={{ 
              border: '2px dashed var(--color-border)', 
              borderRadius: '8px', 
              padding: '3rem 2rem', 
              textAlign: 'center',
              background: 'rgba(255,255,255,0.01)',
              marginBottom: '1.5rem',
              position: 'relative'
            }}>
              <input 
                type="file" 
                multiple 
                onChange={handleFileChange}
                accept="image/*,.pdf"
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0, cursor: 'pointer' }}
              />
              <UploadCloud size={48} className="text-muted" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ marginBottom: '0.5rem' }}>Click or drag documents to this area</h3>
              <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                Upload your Passport, Driver's License, or National ID. <br/> Maximum 3 files. PDF, JPG, or PNG. Max 5MB each.
              </p>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {files.map((file, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--color-primary-light)', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                      <FileText size={16} className="text-muted" />
                      <span>{file.name}</span>
                    </div>
                    <button type="button" onClick={() => removeFile(i)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Selfie Section */}
            {files.length > 0 && (
              <div style={{ marginBottom: '1.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <Camera size={20} className="text-muted" /> Step 2: Live Verification Array
                </h4>
                
                {!selfieImage && !isCameraActive && (
                  <button type="button" onClick={startCamera} className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--color-accent)', color: 'var(--color-text-main)' }}>
                    Open Camera to Take Selfie
                  </button>
                )}

                <div style={{ display: isCameraActive ? 'block' : 'none', position: 'relative', maxWidth: '320px', margin: '0 auto' }}>
                  <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', borderRadius: '8px', border: '2px solid var(--color-accent)' }}></video>
                  <button type="button" onClick={captureSelfie} className="btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
                    Capture Photo
                  </button>
                </div>
                
                <canvas ref={canvasRef} width="320" height="240" style={{ display: 'none' }}></canvas>

                {selfieImage && (
                  <div>
                    <img src={selfieImage} alt="Selfie" style={{ width: '320px', borderRadius: '8px', border: '2px solid var(--color-success)', marginBottom: '1rem' }} />
                    <div>
                      <button type="button" onClick={() => { setSelfieImage(null); startCamera(); }} style={{ background: 'transparent', border: 'none', color: 'var(--color-accent)', cursor: 'pointer' }}>
                        Retake Selfie
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {message && <div style={{ marginBottom: '1rem', color: message.includes('success') ? 'var(--color-success)' : 'var(--color-danger)' }}>{message}</div>}

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem', opacity: (!selfieImage || files.length === 0) ? 0.5 : 1 }} disabled={uploading || files.length === 0 || !selfieImage}>
              {uploading ? 'Securely Uploading...' : 'Submit Documents for Verification'}
            </button>
          </form>
        )}
      </div>
    </motion.div>
  );
}
