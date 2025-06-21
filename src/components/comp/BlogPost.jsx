import React, { useState, useEffect } from 'react';
import './BlogPost.css';

const BlogPost = ({ image = null }) => {
  const [showImage, setShowImage] = useState(false);

  useEffect(() => {
    if (image) {
      setShowImage(true);
    }
  }, [image]);

  const handleClick = () => {
    window.location.href = 'http://localhost:5173';
  };

  return (
    <div className='contain' onClick={handleClick}>
      <div className="main">
        <div className="top">
          <div className="profilePhoto">
            <img src="" alt="Profile" />
          </div>
          <div className="date">Tue-3rd-2025</div>
        </div>

        <div className="body">
          <div className="title">First blog</div>
          <div className="main-body">
            {showImage && (
              <div className='image-data'>
                <img src={image} alt="Blog visual" />
              </div>
            )}
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet sequi natus et quia perferendis? 
              Fugiat accusamus tempore exercitationem magnam laudantium in atque nihil, ullam esse omnis 
              velit ipsam possimus vitae?
            </p>
          </div>
        </div>

        <div className="foot">
          <div className="like">
            <img src="" alt="Like" />
          </div>
          <div className="comment">
            <img src="" alt="Comment" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
