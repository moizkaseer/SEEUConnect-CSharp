import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import EventCard from '@/components/EventCard';
import FilterTabs from '@/components/FilterTabs';
import SubmitModal from '@/components/SubmitModal';
import { Input } from '@/components/ui/input';
import { Search, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import API_CONFIG from '@/config/api';

type UserSubmit = {
  id: number;
  title: string;
  location: string;
  category: string;
  date: string;
  description: string;
  time: string;
  tags: string[] | string | null; // Updated type to allow null
  votes: number;
};

const Index = () => {
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [submissions, setSubmissions] = useState<UserSubmit[]>([]);
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async () => {
    // 1. Check if email is empty
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }

    const newUser = {
      email: email
    };

    try {
      // 2. Send to .NET Backend using centralized config
      const response = await fetch(API_CONFIG.USERS.SUBSCRIBE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      // 3. Check for specific backend errors (like "User already exists")
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
      }

      // 4. SUCCESS!
      toast.success("Successfully subscribed to newsletter!");

      setEmail(""); 
   
      setSubscribed(true);

    } catch (error: any) {
      console.error('Subscription error:', error);
      toast.error(error.message || 'Failed to connect to the server.');
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      // Fetch events from .NET backend using centralized API config
      const response = await fetch(API_CONFIG.EVENTS.GET_ALL_EVENTS, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // We don't need complex cleaning here anymore, just set the data
      // The crash protection will happen inside the render loop
      const data = await response.json();
      setSubmissions(data);
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Failed to load submissions");
    }
  };

  const filteredData = submissions.filter(item => {
    // Safety check: if item is somehow null, skip it
    if (!item) return false;

    const categoryMap: Record<string, string> = {
      events: "event",
      opportunities: "opportunity",
      announcements: "announcement",
    };

    const matchesTab =
      activeTab === "all" ||
      (item.category && item.category.toLowerCase() === categoryMap[activeTab]);

  
    const itemTags = item.tags 
      ? (Array.isArray(item.tags) ? item.tags : item.tags.split(",")) 
      : [];

    const matchesSearch =
      (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      itemTags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTab && (searchQuery === "" || matchesSearch);
  });

  return (
    <div className="min-h-screen flex flex-col bg-background bg-pattern">
      <Header openSubmitModal={() => setIsSubmitModalOpen(true)} />

      <main className="flex-grow container max-w-5xl mx-auto px-4 py-8">
        <section className="mb-10">
          <div className="mb-8 text-center">
            <h1 className="text-5xl font-bold mb-3 gradient-text">SEEUConnect</h1>
            <p className="text-lg text-muted-foreground">Discover, share, and vote on campus events and opportunities</p>
          </div>

          <div className="relative mb-8">
            <div className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground">
              <Search className="h-5 w-5" />
            </div>
            <Input
              placeholder="Search for events, opportunities, or tags..."
              className="pl-10 border-accent bg-white shadow-soft"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <FilterTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          {filteredData.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredData.map((item) => (
                <EventCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  description={item.description}
                  date={item.date}
                  category={item.category ? (item.category.toLowerCase() as any) : 'event'}
                  votes={item.votes}
                  
                
                  tags={
                    item.tags 
                      ? (Array.isArray(item.tags) ? item.tags : item.tags.split(",").map(t => t.trim())) 
                      : [] 
                  }
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-soft p-8 border">
              <p className="text-lg text-muted-foreground">No items found</p>
              <p className="text-muted-foreground/70">Try adjusting your filters or search</p>
            </div>
          )}
        </section>
      </main>

      <footer className="bg-white border-t border-border py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">© 2023 SEEUConnect. All rights reserved.</p>
          <p className="mt-2 text-muted-foreground/70">Subscribe to our weekly digest for campus updates.</p>
        </div>
      </footer>

      <SubmitModal
        isOpen={isSubmitModalOpen}
        onClose={() => {
          setIsSubmitModalOpen(false);
          fetchSubmissions();
        }}
      />

      {/* Floating Subscribe Button */}
      <Button
        onClick={() => setIsSubscribeOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-campus-purple hover:bg-campus-lightPurple shadow-lg flex items-center"
        style={{ borderRadius: '9999px', padding: '0.75rem 1.5rem' }}
      >
        <Mail size={20} className="mr-2" />
        Subscribe
      </Button>

      {/* Subscribe Modal */}
      {isSubscribeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xs relative transition-all duration-200 border">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl"
              onClick={() => setIsSubscribeOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
            {!subscribed ? (
              <>
                <h2 className="text-lg font-semibold mb-2 text-center text-campus-purple">Subscribe to Weekly Digest</h2>
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  Get the best campus updates in your inbox.
                </p>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-campus-purple/40 transition bg-white text-gray-900"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <Button
                  className="w-full bg-campus-purple hover:bg-campus-lightPurple text-base py-2 rounded-lg"
                  style={{ fontWeight: 500 }}
                  onClick={handleSubscribe}
                >
                  Subscribe
                </Button>
              </>
            ) : (
              <div className="text-center">
                <h3 className="text-base font-medium mb-2 text-campus-purple">Thank you for subscribing!</h3>
                <Button
                  className="mt-3 w-full"
                  onClick={() => {
                    setIsSubscribeOpen(false);
                    setSubscribed(false);
                    setEmail('');
                  }}
                >
                  Close
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;