import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Calendar, MapPin, MessageCircle, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import API_CONFIG from '@/config/api';

interface EventDetailsModalProps {
    event: {
        id: number;
        title: string;
        description: string;
        location?: string;
        date?: string;
        category: string;
        votes: number;
        tags: string[];
    };
    onClose: () => void;
}

interface Comment {
    id: number;
    content: string;
    createdAt: string;
    username: string;
}

const EventDetailsModal = ({ event, onClose }: EventDetailsModalProps) => {
    const { user, isAuthenticated } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);

    useEffect(() => {
        loadComments();
    }, [event.id]);

    const loadComments = async () => {
        setLoadingComments(true);
        try {
            const response = await fetch(API_CONFIG.COMMENTS.GET_BY_EVENT(event.id));
            if (response.ok) {
                const data = await response.json();
                setComments(data);
            }
        } catch (err) {
            console.error('Failed to load comments:', err);
        } finally {
            setLoadingComments(false);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        if (!isAuthenticated) {
            toast.error('Please log in to comment');
            return;
        }

        try {
            const response = await fetch(API_CONFIG.COMMENTS.CREATE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user?.token}`,
                },
                body: JSON.stringify({ content: newComment.trim(), eventId: event.id }),
            });

            if (response.ok) {
                const created = await response.json();
                setComments(prev => [...prev, created]);
                setNewComment('');
                toast.success('Comment added!');
            }
        } catch {
            toast.error('Failed to add comment');
        }
    };

    const getCategoryColor = () => {
        switch (event.category.toLowerCase()) {
            case 'event':
                return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'opportunity':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'announcement':
                return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px] bg-white max-h-[85vh] overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.2 }}
                >
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-gray-900">{event.title}</DialogTitle>
                        <DialogDescription className="flex items-center gap-2 text-sm mt-1 text-gray-500">
                            <Badge className={`${getCategoryColor()} font-medium px-3 py-1`}>
                                {event.category}
                            </Badge>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 text-sm mt-4">
                        <motion.div
                            className="space-y-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            {/* Date & Location */}
                            <div className="flex flex-wrap gap-4">
                                {event.date && (
                                    <div className="flex items-center text-gray-600">
                                        <Calendar size={15} className="mr-1.5 text-campus-purple" />
                                        {new Date(event.date).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </div>
                                )}
                                {event.location && (
                                    <div className="flex items-center text-gray-600">
                                        <MapPin size={15} className="mr-1.5 text-campus-purple" />
                                        {event.location}
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <span className="font-medium text-muted-foreground">Description</span>
                                <p className="text-gray-800 mt-1 leading-relaxed">{event.description}</p>
                            </div>

                            {/* Tags */}
                            {event.tags.length > 0 && (
                                <div>
                                    <span className="font-medium text-muted-foreground">Tags</span>
                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                        {event.tags.map((tag, index) => (
                                            <Badge key={index} variant="outline" className="text-xs bg-gray-50">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Votes */}
                            <div className="flex items-center gap-2 text-gray-600">
                                <span className="font-semibold text-campus-purple text-lg">{event.votes}</span>
                                <span className="text-muted-foreground">people interested</span>
                            </div>
                        </motion.div>

                        {/* Comments Section */}
                        <motion.div
                            className="border-t pt-4 mt-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <MessageCircle size={16} className="text-campus-purple" />
                                <span className="font-medium text-gray-800">
                                    Comments {comments.length > 0 && `(${comments.length})`}
                                </span>
                            </div>

                            {/* Comment list */}
                            <div className="space-y-3 max-h-48 overflow-y-auto mb-3">
                                {loadingComments ? (
                                    <div className="text-center py-4 text-gray-400 text-xs">Loading comments...</div>
                                ) : comments.length === 0 ? (
                                    <div className="text-center py-4 text-gray-400 text-xs">No comments yet. Be the first!</div>
                                ) : (
                                    comments.map(c => (
                                        <div key={c.id} className="bg-gray-50 rounded-lg px-3 py-2">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-semibold text-campus-purple">{c.username}</span>
                                                <span className="text-[10px] text-gray-400">
                                                    {new Date(c.createdAt).toLocaleDateString('en-US', {
                                                        month: 'short', day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700">{c.content}</p>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Add comment */}
                            {isAuthenticated ? (
                                <div className="flex items-center gap-2">
                                    <Input
                                        placeholder="Add a comment..."
                                        value={newComment}
                                        onChange={e => setNewComment(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                                        className="flex-1 text-sm"
                                    />
                                    <Button
                                        onClick={handleAddComment}
                                        disabled={!newComment.trim()}
                                        size="icon"
                                        className="bg-campus-purple hover:bg-campus-lightPurple h-9 w-9 shrink-0"
                                    >
                                        <Send size={14} />
                                    </Button>
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400 text-center">Log in to leave a comment</p>
                            )}
                        </motion.div>

                        <motion.div
                            className="flex justify-end pt-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Button variant="outline" onClick={onClose}>
                                Close
                            </Button>
                        </motion.div>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
};

export default EventDetailsModal;
