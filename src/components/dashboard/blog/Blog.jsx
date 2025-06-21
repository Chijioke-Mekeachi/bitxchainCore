import React, { useEffect, useState } from 'react';
import BlogPost from '../../comp/BlogPost';

const Blog = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchAllPosts = async () => {
      try {
        const response = await fetch("https://rpc.blurt.world", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: 1,
            jsonrpc: "2.0",
            method: "condenser_api.get_discussions_by_blog",
            params: [{
              tag: "promoblurt",
              limit: 10  // You can increase this limit if you want
            }]
          })
        });

        const result = await response.json();
        if (result.result && result.result.length > 0) {
          const enrichedPosts = result.result.map((post) => {
            let profileImage = `https://images.blurt.world/u/${post.author}/avatar`;

            try {
              const meta = JSON.parse(post.json_metadata || '{}');
              const customImg = meta?.profile?.profile_image;
              if (customImg) {
                profileImage = customImg;
              }
            } catch (_) {}

            return {
              ...post,
              profileImage
            };
          });

          setPosts(enrichedPosts);
        }
      } catch (err) {
        console.error("Failed to fetch Blurt blog posts:", err);
      }
    };

    fetchAllPosts();
  }, []);

  return (
    <div>
      {posts.map((post, index) => (
        <BlogPost key={index} post={post} />
      ))}
    </div>
  );
};

export default Blog;
