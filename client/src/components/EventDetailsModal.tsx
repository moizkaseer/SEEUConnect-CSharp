import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface EventDetailsModalProps {
    event: {
        title: string;
        description: string;
        date?: string;
        category: string;
        votes: number;
        tags: string[];
    };
    onClose: () => void;
}

const EventDetailsModal = ({ event, onClose }: EventDetailsModalProps) => {
    const getCategoryColor = () => {
        switch (event.category.toLowerCase()) {
            case 'event':
                return 'bg-purple-500/20 text-purple-400 border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/20';
            case 'opportunity':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20';
            case 'announcement':
                return 'bg-amber-500/20 text-amber-400 border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30 dark:bg-gray-500/10 dark:text-gray-300 dark:border-gray-500/20';
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-900 dark:border-gray-800">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.2 }}
                >
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">{event.title}</DialogTitle>
                        <DialogDescription className="flex items-center gap-2 text-sm mt-1 text-gray-500 dark:text-gray-400">
                            <Badge className={`${getCategoryColor()} font-medium px-3 py-1`}>
                                {event.category}
                            </Badge>
                            {event.date ? `• ${new Date(event.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                            })}` : '• Date TBA'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 text-sm mt-4">
                        <motion.div 
                            className="space-y-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            <div>
                                <span className="font-medium text-muted-foreground dark:text-gray-400">Description:</span>
                                <p className="text-gray-800 dark:text-gray-200 mt-1">{event.description}</p>
                            </div>

                            <div>
                                <span className="font-medium text-muted-foreground dark:text-gray-400">Tags:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {event.tags.map((tag, index) => (
                                        <Badge
                                            key={index}
                                            variant="outline"
                                            className="text-xs bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                                        >
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <span className="font-medium text-muted-foreground dark:text-gray-400">Votes:</span>
                                <p className="text-gray-700 dark:text-gray-300 mt-1">{event.votes}</p>
                            </div>
                        </motion.div>

                        <motion.div 
                            className="flex justify-end pt-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Button 
                                variant="outline" 
                                onClick={onClose}
                                className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
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
