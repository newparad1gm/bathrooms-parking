import React from 'react';
import '../css/marker.css';

interface IconSelectorProps {
    imageUrls?: string[];
    onClick?: (url: string | null) => void;
}

export const IconSelector = (props: IconSelectorProps): JSX.Element | null => {
    const {imageUrls, onClick} = props;

    const selectIcon = (event: React.MouseEvent<HTMLImageElement>) => {
        if (onClick) {
            onClick(event.currentTarget.getAttribute('src'));
        }
    }
    const removeIcon = () => {
        if (onClick) {
            onClick(null);
        }
    }

    return (
        imageUrls ? 
        <div className='icon-selector'>
            <div className='select-remove-labels'>
                <label className='select-icon-label'>Select Icon</label> <label className='remove-icon-label' onClick={removeIcon}>Remove Icon</label>
            </div>
            <div className='icon-selector-selector'>
                {imageUrls.map((url, i) => (
                    <img key={i} className='icon-selector-image' src={url} alt='' onClick={selectIcon}/> 
                ))}
            </div>
        </div> :
        null
    );
}