import React from 'react';
import './BlogPost.css';

const BlogPost = ({ post }) => {
  const profileImage = post?.profileImage || `https://images.blurt.world/u/${post?.author}/avatar`;

  const handleClick = () => {
    if (post) {
      window.open(`https://blurt.blog/@${post.author}/${post.permlink}`, "_blank");
    }
  };

  return (
    <div className='contain' onClick={handleClick}>
      <div className="main">
        <div className="top">
          <div className="profilePhoto">
            <img src={profileImage} alt="Profile" />
          </div>
          <div className="date">{post?.created?.substring(0, 10)}</div>
        </div>

        <div className="body">
          <div className="title">{post?.title || "Loading title..."}</div>
          <div className="main-body">
            {post?.body ? (
              <div
                dangerouslySetInnerHTML={{ __html: post.body }}
              />
            ) : (
              <p>Loading blog content...</p>
            )}
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
