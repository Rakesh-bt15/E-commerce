import React from 'react'
import './DescriptionBox.css'

const DescriptionBox = () => {
  return (
    <div className='descriptionbox'>
      <div className="descriptionbox-navigator">
        <div className="descriptionbox-nav-box">Description</div>
        <div className='descriptionbox-nav-box fade'>reviews (125)</div>
      </div>
      <div className="descriptionbox-description">
        <p>Discover a stylish collection of premium-quality clothing designed for comfort, durability, and everyday elegance.
            Our outfits are crafted using high-quality fabrics that feel soft on the skin while providing a perfect fit.
            Whether for casual wear, office looks, or special occasions, our clothing helps you look confident and feel comfortable all day long.
        </p>
        <p>Upgrade your wardrobe with our thoughtfully designed clothing made for everyday comfort and timeless style. 
            Each piece is crafted from high-quality fabrics to ensure a perfect fit, long-lasting durability, and a premium feel. 
            Whether you’re dressing up or keeping it casual, our collection fits every lifestyle.</p>
      </div>
    </div>
  )
}

export default DescriptionBox
