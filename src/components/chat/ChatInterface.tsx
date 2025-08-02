import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, TrendingUp, BarChart3, Activity, Map } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TradingViewChart, TradingViewWatchlist, TradingViewTicker, TradingViewHeatmap } from "@/components/widgets";

interface Message {
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatInterfaceProps {
  user: any;
}

export const ChatInterface = ({ user }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      content: "Welcome to TradeTalk! 📈 I'm your AI trading companion. Ask me about chart patterns, technical indicators, market analysis, or upload a chart image for pattern recognition. How can I help you with your trading today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "Come back soon for more trading insights!",
    });
  };

  const handleSendMessage = async (messageContent: string, image?: File) => {
    if (!messageContent.trim() && !image) return;

    // Add user message
    const userMessage: Message = {
      content: messageContent || "📊 Chart image uploaded for analysis",
      isUser: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      let imageBase64 = "";
      if (image) {
        // Convert image to base64
        const reader = new FileReader();
        imageBase64 = await new Promise((resolve) => {
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]); // Remove data:image/... prefix
          };
          reader.readAsDataURL(image);
        });
      }

      // Call Gemini AI
      const { data, error } = await supabase.functions.invoke('chat-with-gemini', {
        body: {
          message: messageContent,
          image: imageBase64,
          conversationHistory: messages.slice(-5) // Send last 5 messages for context
        }
      });

      if (error) throw error;

      // Add AI response
      const aiMessage: Message = {
        content: data.response,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
      
      // Add error message
      const errorMessage: Message = {
        content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-card px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <div>
            <h1 className="font-semibold text-card-foreground">TradeTalk AI</h1>
            <p className="text-sm text-muted-foreground">Trading Companion</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{user.email}</span>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-1" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="chat" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-4 mx-4 mt-4">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Charts
            </TabsTrigger>
            <TabsTrigger value="watchlist" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Watchlist
            </TabsTrigger>
            <TabsTrigger value="heatmap" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              Heatmap
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 overflow-y-auto p-4 space-y-4">
            <Card className="p-4">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <ChatMessage key={index} message={message} />
                ))}
                
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-muted text-muted-foreground rounded-lg p-3 max-w-[80%]">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-100"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="charts" className="flex-1 overflow-y-auto p-4">
            <Card className="p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Market Ticker</h3>
                  <TradingViewTicker />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Advanced Chart</h3>
                  <TradingViewChart height={600} />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="watchlist" className="flex-1 overflow-y-auto p-4">
            <Card className="p-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Market Overview</h3>
                <TradingViewWatchlist height={600} />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="heatmap" className="flex-1 overflow-y-auto p-4">
            <Card className="p-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Market Heatmap</h3>
                <TradingViewHeatmap height={600} />
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Chat Input - Only show on chat tab */}
      <div className="p-4">
        <ChatInput onSendMessage={handleSendMessage} disabled={loading} />
      </div>
    </div>
  );
};