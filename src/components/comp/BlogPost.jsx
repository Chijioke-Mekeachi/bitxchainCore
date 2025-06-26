import React from 'react';
import './BlogPost.css';
import like from '../../assets/like.png';
import comment from '../../assets/comment.png';
import { marked } from 'marked';

const BlogPost = ({ post }) => {
  const profileImage = post?.profileImage || `https://images.blurt.world/u/${post?.author}/avatar`;

  const handleClick = () => {
    if (post) {
      window.open(`https://blurt.blog/@${post.author}/${post.permlink}`, "_blank");
    }
  };

  // Convert Markdown to HTML
  const htmlBody = post?.body ? marked.parse(post.body) : '';

  // Extract image links from markdown
  const extractImageUrlsFromMarkdown = (text) => {
    const regex = /!\[.*?\]\((https?:\/\/[^\s)]+)\)/g;
    const matches = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      matches.push(match[1]);
    }
    return matches;
  };

  const imageLinks = post?.body ? extractImageUrlsFromMarkdown(post.body) : [];

  return (
    <div className="contain" onClick={handleClick}>
      <div className="main">
        <div className="top">
          <div className="profilePhoto">
            <img src={profileImage} alt="Profile" />
          </div>
          <div className="date">{post?.created?.substring(0, 10)}</div>
        </div>

        <div className="body">
          <div className="title">{post?.title || "Loading title..."}</div>

          <div className="main-body" onClick={(e) => e.stopPropagation()}>
            {post?.body ? (
              <div
                dangerouslySetInnerHTML={{ __html: htmlBody }}
              />
            ) : (
              <p>Loading blog content...</p>
            )}
          </div>

          {/* ✅ Display extracted images */}
          {imageLinks.length > 0 && (
            <div className="image-data" onClick={(e) => e.stopPropagation()}>
              {imageLinks.map((src, index) => (
                <img key={index} src={src} alt={`img-${index}`} />
              ))}
            </div>
          )}
        </div>

        <div className="foot">
          <div className="like">
            <img src={like} alt="Like" />
          </div>
          <div className="comment">
            <img src={comment} alt="Comment" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
