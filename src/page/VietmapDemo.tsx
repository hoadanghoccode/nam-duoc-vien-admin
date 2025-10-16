import React from 'react';
import { VietmapSearch } from '../helpers/VietmapSearch';

const VietmapDemo: React.FC = () => {
  return (
    <div style={{ 
      height: '50vh',
      width: '100%',
      position: 'relative',
      background: '#f5f5f5'
    }}>
      <VietmapSearch />
    </div>
  );
};

export default VietmapDemo;
