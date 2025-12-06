import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import API from "../api";
import { toast } from "react-toastify";
import { 
  FaCloudUploadAlt, FaSearch, FaFilePdf, FaFileImage, FaFileWord, FaFileAlt, 
  FaTrash, FaDownload, FaSignOutAlt, FaThLarge, FaList, FaShieldAlt, FaHdd, FaBars 
} from "react-icons/fa";

// Import CSS
import "./Dashboard.css"; 

function Dashboard() {
  const [files, setFiles] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  // --- Auto Logout Logic ---
  useEffect(() => {
    const TIMEOUT = 15 * 60 * 1000; // 15 Minutes
    let timer;
    const resetTimer = () => {
      if(timer) clearTimeout(timer);
      timer = setTimeout(() => {
        toast.info("Session expired due to inactivity");
        handleLogout();
      }, TIMEOUT);
    };
    
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keypress", resetTimer);
    resetTimer();
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keypress", resetTimer);
    };
  }, []);

  // --- Fetch Files ---
  useEffect(() => { fetchFiles(); }, []);

  const fetchFiles = async () => {
    try {
      const res = await API.get("/files/list");
      setFiles(res.data);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // --- Drag & Drop ---
  const onDrop = useCallback(accepted => {
    if (accepted.length) {
      setSelectedFile(accepted[0]);
      toast.info(`Ready to encrypt: ${accepted[0].name}`);
    }
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false });

  // --- Actions ---
  const handleUpload = async () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append("file", selectedFile);
    setUploading(true);
    try {
      await API.post("/files/upload", formData, {
        onUploadProgress: (p) => setUploadProgress(Math.round((100 * p.loaded) / p.total)),
      });
      toast.success("File Encrypted & Saved!");
      setSelectedFile(null);
      setUploadProgress(0);
      fetchFiles();
    } catch (e) {
      toast.error("Upload Failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (id, name) => {
    try {
      const res = await API.get(`/files/download/${id}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url; link.download = name; 
      document.body.appendChild(link); link.click(); link.remove();
      toast.success("Decrypted Successfully!");
    } catch (e) {
      toast.error("Decryption Failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this file permanently?")) return;
    try {
      await API.delete(`/files/delete/${id}`);
      toast.success("File deleted.");
      fetchFiles();
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  // --- Helper: Get Icon ---
  const getFileIcon = (name) => {
    const ext = name.split('.').pop().toLowerCase();
    if (["pdf"].includes(ext)) return <FaFilePdf color="#ef4444" />;
    if (["jpg", "png", "jpeg"].includes(ext)) return <FaFileImage color="#22c55e" />;
    if (["doc", "docx"].includes(ext)) return <FaFileWord color="#3b82f6" />;
    return <FaFileAlt color="#94a3b8" />;
  };

  const filteredFiles = files.filter(f => f.original_filename.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="dashboard-container">
      
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "" : "closed"}`}>
        <div className="brand">
          <FaShieldAlt size={28} /> VaultX
        </div>
        
        <div className="nav-item active">
          <FaHdd /> My Storage
        </div>
        
        <div className="nav-item" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </div>

        <div className="storage-box">
          <div style={{display:'flex', justifyContent:'space-between', marginBottom:'5px'}}>
            <small>Used Space</small>
            <small>{files.length} Files</small>
          </div>
          <div className="progress-bg">
            <div className="progress-fill" style={{width: '65%'}}></div>
          </div>
          <small style={{opacity:0.7}}>AES-256 Encrypted</small>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`main-content ${sidebarOpen ? "" : "expanded"}`}>
        
        {/* Top Header */}
        <header className="top-bar">
          <div className="header-left">
            <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <FaBars size={18} />
            </button>
            <div>
              <h2 style={{margin:0, fontSize:'1.5rem'}}>My Files</h2>
              <small style={{color:'#64748b'}}>Welcome back, {username}</small>
            </div>
          </div>

          <div style={{display:'flex', alignItems:'center'}}>
            <div className="search-container">
              <FaSearch color="#94a3b8" />
              <input 
                className="search-input" 
                placeholder="Search encrypted files..." 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
            
            <div className="view-toggles">
              <button 
                className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`} 
                onClick={() => setViewMode('grid')}
              >
                <FaThLarge />
              </button>
              <button 
                className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`} 
                onClick={() => setViewMode('list')}
              >
                <FaList />
              </button>
            </div>
          </div>
        </header>

        {/* Compact Upload Section */}
        <div className={`upload-area ${isDragActive ? 'active' : ''}`} {...getRootProps()}>
          <input {...getInputProps()} />
          
          <div className="upload-left">
            <div className="upload-icon-small">
              <FaCloudUploadAlt />
            </div>
            <div>
              <h4 style={{margin:0, color:'#334155'}}>
                {selectedFile ? selectedFile.name : "Upload New File"}
              </h4>
              <small style={{color:'#94a3b8'}}>
                {selectedFile ? "Ready to encrypt" : "Drag & drop or click to browse"}
              </small>
            </div>
          </div>

          <button 
            className="upload-btn-compact" 
            onClick={(e) => { e.stopPropagation(); handleUpload(); }} 
            disabled={uploading}
          >
            {uploading ? `Encrypting ${uploadProgress}%` : "Encrypt & Upload"}
          </button>
        </div>

        {/* Files Grid/List */}
        <div className={viewMode === 'grid' ? "file-grid" : "file-list-view"}>
          {filteredFiles.map((file) => (
            <div key={file.id} className={`file-card ${viewMode === 'list' ? 'list-mode' : ''}`}>
              <div className="card-icon">
                {getFileIcon(file.original_filename)}
              </div>
              
              <div style={{textAlign: viewMode==='list'?'left':'center', flex:1}}>
                <h4 style={{margin: '0 0 5px 0', fontSize:'0.95rem', color:'#334155'}}>
                  {file.original_filename}
                </h4>
                <small style={{color: '#94a3b8'}}>
                  {new Date(file.upload_date).toLocaleDateString()}
                </small>
              </div>

              <div className="card-actions">
                <button 
                  className="action-btn btn-download" 
                  onClick={() => handleDownload(file.id, file.original_filename)} 
                  title="Decrypt"
                >
                  <FaDownload />
                </button>
                <button 
                  className="action-btn btn-delete" 
                  onClick={() => handleDelete(file.id)} 
                  title="Delete"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}

          {filteredFiles.length === 0 && (
            <div style={{textAlign: 'center', gridColumn: '1/-1', padding: '50px', color: '#94a3b8'}}>
              <FaShieldAlt size={40} style={{marginBottom:'15px', opacity:0.5}} />
              <p>No encrypted files found.</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}

export default Dashboard;