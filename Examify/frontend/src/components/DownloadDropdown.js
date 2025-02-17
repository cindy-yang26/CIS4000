import React, { useState, useRef, useEffect } from 'react';
import { FaDownload, FaChevronDown } from 'react-icons/fa';

const DownloadDropdown = ({ onLatexDownload, onDocsDownload }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="download-dropdown" ref={dropdownRef}>
      <button 
        className="download-button flex items-center gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FaDownload /> Export <FaChevronDown className="text-sm" />
      </button>
      
      {isOpen && (
        <div className="download-dropdown-content">
          <button onClick={() => {
            onLatexDownload();
            setIsOpen(false);
          }}>
            LaTeX
          </button>
          <button onClick={() => {
            onDocsDownload();
            setIsOpen(false);
          }}>
            DOCX
          </button>
        </div>
      )}
    </div>
  );
};

export default DownloadDropdown;