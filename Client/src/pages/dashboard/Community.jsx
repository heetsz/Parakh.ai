import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Textarea } from "../../components/ui/textarea";
import { Input } from "../../components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "../../components/ui/sheet";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { Heart, MessageCircle, Send, Plus, Image, Link, FileText, Trash2 } from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  // New post state
  const [newPost, setNewPost] = useState({
    content: "",
    attachments: []
  });
  
  // Comment state
  const [commentInputs, setCommentInputs] = useState({});
  
  useEffect(() => {
    fetchPosts();
  }, []);
  
  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API_URL}/community/posts`, {
        withCredentials: true
      });
      setPosts(response.data.posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreatePost = async () => {
    if (!newPost.content.trim()) return;
    
    setIsCreating(true);
    try {
      const response = await axios.post(
        `${API_URL}/community/posts`,
        newPost,
        { withCredentials: true }
      );
      
      setPosts([response.data.post, ...posts]);
      setNewPost({ content: "", attachments: [] });
      setIsSheetOpen(false); // Close the sheet after posting
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post: " + (error.response?.data?.message || error.message));
    } finally {
      setIsCreating(false);
    }
  };
  
  const handleLike = async (postId) => {
    try {
      const response = await axios.put(
        `${API_URL}/community/posts/${postId}/like`,
        {},
        { withCredentials: true }
      );
      
      setPosts(posts.map(post => 
        post._id === postId 
          ? { ...post, likes: response.data.isLiked 
              ? [...post.likes, "user"] 
              : post.likes.slice(0, -1) 
            }
          : post
      ));
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };
  
  const handleComment = async (postId) => {
    const content = commentInputs[postId];
    if (!content?.trim()) return;
    
    try {
      const response = await axios.post(
        `${API_URL}/community/posts/${postId}/comment`,
        { content },
        { withCredentials: true }
      );
      
      setPosts(posts.map(post => 
        post._id === postId 
          ? { ...post, comments: [...post.comments, response.data.comment] }
          : post
      ));
      
      setCommentInputs({ ...commentInputs, [postId]: "" });
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };
  
  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(
        `${API_URL}/community/posts/${postId}`,
        { withCredentials: true }
      );
      
      setPosts(posts.filter(post => post._id !== postId));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };
  
  const addAttachment = (type) => {
    const url = prompt(`Enter ${type} URL:`);
    if (url) {
      setNewPost({
        ...newPost,
        attachments: [...newPost.attachments, { type, url, name: url.split('/').pop() }]
      });
    }
  };
  
  const removeAttachment = (index) => {
    setNewPost({
      ...newPost,
      attachments: newPost.attachments.filter((_, i) => i !== index)
    });
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <p className="text-muted-foreground">Loading community posts...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Community</h1>
          <p className="text-muted-foreground">Connect and share with the community</p>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post._id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {post.author?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{post.author?.name || "Anonymous"}</CardTitle>
                    <CardDescription>
                      {new Date(post.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeletePost(post._id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <p className="text-sm whitespace-pre-wrap">{post.content}</p>
              
              {/* Attachments */}
              {post.attachments?.length > 0 && (
                <div className="space-y-2">
                  {post.attachments.map((attachment, idx) => (
                    <div key={idx}>
                      {attachment.type === 'image' && (
                        <img
                          src={attachment.url}
                          alt="attachment"
                          className="rounded-lg max-h-96 w-full object-cover"
                        />
                      )}
                      {attachment.type === 'link' && (
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-500 hover:underline"
                        >
                          <Link className="h-4 w-4" />
                          {attachment.name || attachment.url}
                        </a>
                      )}
                      {attachment.type === 'document' && (
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-500 hover:underline"
                        >
                          <FileText className="h-4 w-4" />
                          {attachment.name || 'Document'}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            
            <Separator />
            
            <CardFooter className="flex-col gap-3 pt-4">
              {/* Actions */}
              <div className="flex items-center gap-4 w-full">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(post._id)}
                  className="gap-2"
                >
                  <Heart className={`h-4 w-4 ${post.likes?.length > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                  {post.likes?.length || 0}
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                  <MessageCircle className="h-4 w-4" />
                  {post.comments?.length || 0}
                </Button>
              </div>
              
              {/* Comments */}
              {post.comments?.length > 0 && (
                <div className="w-full space-y-3">
                  {post.comments.map((comment) => (
                    <div key={comment._id} className="flex gap-3 text-sm">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {comment.author?.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{comment.author?.name || "Anonymous"}</p>
                        <p className="text-muted-foreground">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Add Comment */}
              <div className="flex gap-2 w-full">
                <Input
                  placeholder="Add a comment..."
                  value={commentInputs[post._id] || ""}
                  onChange={(e) => setCommentInputs({
                    ...commentInputs,
                    [post._id]: e.target.value
                  })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleComment(post._id);
                    }
                  }}
                />
                <Button
                  size="icon"
                  onClick={() => handleComment(post._id)}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Floating Create Post Button */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button
            size="lg"
            className="fixed bottom-8 right-8 rounded-full shadow-lg h-14 w-14"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle>Create Post</SheetTitle>
            <SheetDescription>Share your thoughts with the community</SheetDescription>
          </SheetHeader>
          
          <div className="mt-6 space-y-4">
            <Textarea
              placeholder="What's on your mind?"
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              className="min-h-[150px] resize-none"
            />
            
            {/* Attachments */}
            {newPost.attachments.length > 0 && (
              <div className="space-y-2">
                {newPost.attachments.map((attachment, idx) => (
                  <Badge key={idx} variant="secondary" className="gap-2">
                    {attachment.type === 'image' && <Image className="h-3 w-3" />}
                    {attachment.type === 'link' && <Link className="h-3 w-3" />}
                    {attachment.type === 'document' && <FileText className="h-3 w-3" />}
                    <span className="truncate max-w-[200px]">{attachment.name}</span>
                    <button onClick={() => removeAttachment(idx)} className="ml-1">×</button>
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Attachment Buttons */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addAttachment('image')}
              >
                <Image className="h-4 w-4 mr-2" />
                Image
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addAttachment('link')}
              >
                <Link className="h-4 w-4 mr-2" />
                Link
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addAttachment('document')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Document
              </Button>
            </div>
            
            <Button
              onClick={handleCreatePost}
              disabled={!newPost.content.trim() || isCreating}
              className="w-full"
            >
              {isCreating ? "Posting..." : "Post"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
