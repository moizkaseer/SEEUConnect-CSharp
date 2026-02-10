import React, { useState } from 'react';
import { ArrowUp, Calendar, Users, MapPin } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import EventDetailsModal from './EventDetailsModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import API_CONFIG from '@/config/api';

interface EventCardProps {
  id: number;
  title: string;
  description: string;
  location?: string;
  date?: string;
  category: 'event' | 'opportunity' | 'announcement';
  votes: number;
  tags: string[];
}

const EventCard = ({ id, title, description, location, date, category, votes, tags = [] }: EventCardProps) => {
  const { user, isAuthenticated } = useAuth();
  const [voteCount, setVoteCount] = useState(votes || 0);
  const [hasVoted, setHasVoted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventCardProps | null>(null);

  const handleVote = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please log in to vote');
      return;
    }

    const newVoted = !hasVoted;
    const newCount = newVoted ? voteCount + 1 : voteCount - 1;

    // Optimistic update
    setVoteCount(newCount);
    setHasVoted(newVoted);
    newVoted ? toast.success('Vote added!') : toast.info('Vote removed');

    try {
      await fetch(API_CONFIG.EVENTS.VOTE(id), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ vote: newVoted }),
      });
    } catch {
      // Revert on failure
      setVoteCount(voteCount);
      setHasVoted(hasVoted);
      toast.error('Failed to save vote');
    }
  };

  const handleCardClick = () => {
    setSelectedEvent({ id, title, description, location, date, category, votes: voteCount, tags });
    setIsModalOpen(true);
  };

  const getCategoryColor = () => {
    switch (category) {
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

  const safeTags = Array.isArray(tags) ? tags : [];

  return (
    <>
      <HoverCard>
        <HoverCardTrigger asChild>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            <Card
              className={`h-full overflow-hidden transition-all duration-200 hover:shadow-lg border-2 hover:border-campus-purple/20 bg-white ${
                isExpanded ? 'card-expanded' : ''
              }`}
              onClick={handleCardClick}
            >
              <CardContent className="p-0">
                <div className="flex flex-col h-full">
                  <div className="p-5 flex-grow">
                    <div className="flex justify-between items-start mb-3">
                      <Badge className={`${getCategoryColor()} font-medium px-3 py-1`}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </Badge>

                      <motion.div
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center p-1.5 rounded-full transition-colors ${
                          hasVoted ? 'bg-campus-purple/10' : 'bg-gray-50'
                        }`}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 h-6 w-6 hover:bg-transparent"
                          onClick={handleVote}
                        >
                          <ArrowUp
                            size={18}
                            className={`transition-colors ${
                              hasVoted ? 'text-campus-purple' : 'text-gray-400'
                            }`}
                          />
                        </Button>
                        <span
                          className={`text-sm font-medium px-1 ${
                            hasVoted ? 'text-campus-purple' : 'text-gray-600'
                          }`}
                        >
                          {voteCount}
                        </span>
                      </motion.div>
                    </div>

                    <h3 className="mb-2 text-lg font-bold line-clamp-2 text-gray-800">{title}</h3>

                    {date && (
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <Calendar size={14} className="mr-1.5 shrink-0" />
                        {new Date(date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    )}

                    {location && (
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <MapPin size={14} className="mr-1.5 shrink-0" />
                        <span className="truncate">{location}</span>
                      </div>
                    )}

                    <p className="mb-3 text-sm text-gray-600 line-clamp-2">{description}</p>

                    <div className="flex flex-wrap gap-1.5 mt-auto">
                      {safeTags.slice(0, 3).map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs bg-gray-50 hover:bg-gray-100 transition-colors">
                          {tag}
                        </Badge>
                      ))}
                      {safeTags.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{safeTags.length - 3}</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-3 bg-gray-50/50 border-t flex justify-between items-center">
                <div className="flex items-center text-sm text-gray-500">
                  <Users size={14} className="mr-1.5" />
                  {voteCount} interested
                </div>
                <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-campus-purple">
                  View Details
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </HoverCardTrigger>

        <HoverCardContent className="p-4 w-80 shadow-lg border-2 border-gray-100">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            <h4 className="font-semibold text-gray-800">{title}</h4>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar size={14} className="mr-1.5" />
              {date ? new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Date TBA'}
            </div>
            {location && (
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin size={14} className="mr-1.5" />
                {location}
              </div>
            )}
            <p className="text-sm text-gray-600">{description}</p>
            <div className="flex flex-wrap gap-1.5">
              {safeTags.map((tag, i) => (
                <Badge key={i} variant="outline" className="text-xs bg-gray-50">{tag}</Badge>
              ))}
            </div>
            <div className="text-xs text-primary font-medium">Click for more details</div>
          </motion.div>
        </HoverCardContent>
      </HoverCard>

      <AnimatePresence>
        {isModalOpen && selectedEvent && (
          <EventDetailsModal event={selectedEvent} onClose={() => setIsModalOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default EventCard;
