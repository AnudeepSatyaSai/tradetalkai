import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Upload } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string, image?: File) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSendMessage, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const handleSubmit = () => {
    if (message.trim() || selectedImage) {
      onSendMessage(message.trim(), selectedImage || undefined);
      setMessage("");
      setSelectedImage(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
    }
  };

  return (
    <div className="border-t bg-background p-4">
      {selectedImage && (
        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
          <span>📊 Chart image selected: {selectedImage.name}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedImage(null)}
          >
            Remove
          </Button>
        </div>
      )}
      
      <div className="flex gap-2">
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            id="image-upload"
          />
          <Button variant="outline" size="icon" asChild>
            <label htmlFor="image-upload" className="cursor-pointer">
              <Upload className="h-4 w-4" />
            </label>
          </Button>
        </div>
        
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about trading patterns, chart analysis, or market insights..."
          className="flex-1 min-h-[40px] max-h-32 resize-none"
          disabled={disabled}
        />
        
        <Button 
          onClick={handleSubmit} 
          disabled={disabled || (!message.trim() && !selectedImage)}
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};