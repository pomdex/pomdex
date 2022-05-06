import React from 'react'
import PropTypes from 'prop-types'
import fallbackImage from '../../images/tokens/fallback.png'

const AssetLogo = ({src, alt, className}) => {
  return(
    <img
      src={src}
      alt={alt ?? ''}
      className={className ?? ''}
      onError={({ currentTarget }) => {
        currentTarget.onerror = null;
        currentTarget.src = fallbackImage;
      }}
    />
  );
}

AssetLogo.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  className: PropTypes.string,
}

export default AssetLogo