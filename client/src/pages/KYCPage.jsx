import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { UploadCloud, CheckCircle, AlertTriangle, FileText, X } from 'lucide-react';

export default function KYCPage() {
  const { user } = useContext(AuthContext);
  const [kycStatus, setKycStatus] = useState('Unverified');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

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

      const res = await axios.post('http://localhost:5000/api/kyc/upload', { documents: base64Files }, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      setKycStatus(res.data.kycStatus);
      setFiles([]);
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

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

            {message && <div style={{ marginBottom: '1rem', color: message.includes('success') ? 'var(--color-success)' : 'var(--color-danger)' }}>{message}</div>}

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem' }} disabled={uploading || files.length === 0}>
              {uploading ? 'Securely Uploading...' : 'Submit Documents for Verification'}
            </button>
          </form>
        )}
      </div>
    </motion.div>
  );
}
