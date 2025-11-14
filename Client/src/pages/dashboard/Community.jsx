import { useState, useEffect, useRef } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Textarea } from "../../components/ui/textarea";
import { Input } from "../../components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { Heart, MessageCircle, Send, Plus, Image, Link, FileText, Trash2, Upload } from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_PRESET_NAME;

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserImage, setCurrentUserImage] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  
  // New post state
  const [newPost, setNewPost] = useState({
    content: "",
    attachments: []
  });
  
  // Comment state
  const [commentInputs, setCommentInputs] = useState({});
  const [showComments, setShowComments] = useState({});
  
  // File upload
  const [uploading, setUploading] = useState(false);
  const imageInputRef = useRef(null);
  
  useEffect(() => {
    fetchCurrentUser();
    fetchPosts();
  }, []);
  
  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/me`, {
        withCredentials: true
      });
      setCurrentUserId(response.data._id);
      setCurrentUserImage(response.data?.image || "");
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };
  
  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API_URL}/community/posts`, {
        withCredentials: true
      });
      // Sort posts by number of likes (descending)
      const sortedPosts = response.data.posts.sort((a, b) => {
        return (b.likes?.length || 0) - (a.likes?.length || 0);
      });
      setPosts(sortedPosts);
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
      setIsDialogOpen(false); // Close the dialog after posting
    } catch (error) {
      console.error("Error creating post:", error);
      // alert("Failed to create post: " + (error.response?.data?.message || error.message));
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
  
  const handleDeleteComment = async (postId, commentId) => {
    try {
      await axios.delete(
        `${API_URL}/community/posts/${postId}/comment/${commentId}`,
        { withCredentials: true }
      );
      
      setPosts(posts.map(post => 
        post._id === postId 
          ? { ...post, comments: post.comments.filter(c => c._id !== commentId) }
          : post
      ));
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };
  
  const confirmDelete = (postId) => {
    setPostToDelete(postId);
    setDeleteDialogOpen(true);
  };

  const handleDeletePost = async () => {
    if (!postToDelete) return;
    
    try {
      await axios.delete(
        `${API_URL}/community/posts/${postToDelete}`,
        { withCredentials: true }
      );
      
      setPosts(posts.filter(post => post._id !== postToDelete));
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    } catch (error) {
      console.error("Error deleting post:", error);
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    }
  };
  
  const uploadToCloudinary = async (file, resourceType = 'auto') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    
    try {
      console.log('Uploading to Cloudinary...', {
        cloudName: CLOUDINARY_CLOUD_NAME,
        preset: CLOUDINARY_UPLOAD_PRESET,
        resourceType,
        fileName: file.name,
        url: `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`
      });
      
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
        formData
      );
      
      // console.log('Upload successful:', response.data);
      return response.data.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.response?.data?.error?.message);
      
      // Show specific error message
      const errorMsg = error.response?.data?.error?.message || 'Unknown error';
      // alert(`Upload failed: ${errorMsg}`);
      throw error;
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      // alert('Please select an image file');
      return;
    }
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      // alert('Image size should be less than 10MB');
      return;
    }
    
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file, 'image');
      setNewPost({
        ...newPost,
        attachments: [...newPost.attachments, { 
          type: 'image', 
          url, 
          name: file.name 
        }]
      });
      // alert('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      // alert('Failed to upload image.');
    } finally {
      setUploading(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }
  };

  const addLinkAttachment = () => {
    const url = prompt('Enter link URL:');
    if (url) {
      setNewPost({
        ...newPost,
        attachments: [...newPost.attachments, { 
          type: 'link', 
          url, 
          name: url.split('/').pop() || 'Link'
        }]
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
    <div className="p-6 w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="ml-4 text-4xl font-bold tracking-tight bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Community</h1>
          <p className="ml-4 text-muted-foreground">Connect and share with the community</p>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4 w-full">
        {posts.map((post) => (
          <Card key={post._id} className="w-full">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    {post.author?.image ? (
                      <AvatarImage src={post.author.image} alt={post.author?.name || "User"} />
                    ) : null}
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
                {currentUserId === post.author?._id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => confirmDelete(post._id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
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
                        <div className="border rounded-lg p-3 bg-muted/50">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <FileText className="h-5 w-5 text-primary" />
                              <div className="flex-1">
                                <p className="text-sm font-medium">{attachment.name || 'Document'}</p>
                                <p className="text-xs text-muted-foreground">PDF Document</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <a
                                href={attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                              >
                                <Button
                                  size="sm"
                                  variant="outline"
                                >
                                  Download PDF
                                </Button>
                              </a>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            
            <Separator />
            
            <CardFooter className="flex-col gap-3 py-0">
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
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => setShowComments({ ...showComments, [post._id]: !showComments[post._id] })}
                >
                  <MessageCircle className="h-4 w-4" />
                  {post.comments?.length || 0}
                </Button>
              </div>
              
              {/* Comments */}
              {showComments[post._id] && post.comments?.length > 0 && (
                <div className="w-full space-y-3">
                  {post.comments.map((comment) => (
                    <div key={comment._id} className="flex gap-3 text-sm">
                      <Avatar className="h-8 w-8">
                        {comment.author?.image ? (
                          <AvatarImage src={comment.author.image} alt={comment.author?.name || "User"} />
                        ) : null}
                        <AvatarFallback className="text-xs">
                          {comment.author?.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{comment.author?.name || "Anonymous"}</p>
                        <p className="text-muted-foreground">{comment.content}</p>
                      </div>
                      {(currentUserId === comment.author?._id || currentUserId === post.author?._id) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteComment(post._id, comment._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Add Comment */}
              {showComments[post._id] && (
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
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Floating Create Post Button */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="fixed bottom-8 right-8 rounded-full shadow-lg h-14 w-14 z-50"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Post</DialogTitle>
            <DialogDescription>Share your thoughts with the community</DialogDescription>
          </DialogHeader>
          
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
            <div className="flex gap-2 flex-wrap">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => imageInputRef.current?.click()}
                disabled={uploading}
              >
                <Image className="h-4 w-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload Image'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addLinkAttachment}
                disabled={uploading}
              >
                <Link className="h-4 w-4 mr-2" />
                Add Link
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Upload images directly or add links to external files (PDFs, documents, etc.)
            </p>
            
            <Button
              onClick={handleCreatePost}
              disabled={!newPost.content.trim() || isCreating}
              className="w-full"
            >
              {isCreating ? "Posting..." : "Post"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setPostToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePost}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
