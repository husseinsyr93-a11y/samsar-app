import { useState } from "react";
import { Send, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  useListConversations, useGetMessages, useSendMessage,
  getListConversationsQueryKey, getGetMessagesQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Messages() {
  const [selectedConv, setSelectedConv] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const queryClient = useQueryClient();

  const { data: conversations, isLoading: convsLoading } = useListConversations({
    query: { queryKey: getListConversationsQueryKey() }
  });
  const { data: messages, isLoading: msgsLoading } = useGetMessages(selectedConv!, {
    query: { enabled: !!selectedConv, queryKey: getGetMessagesQueryKey(selectedConv!) }
  });
  const sendMutation = useSendMessage();

  const selectedConvData = conversations?.find(c => c.id === selectedConv);

  function handleSend() {
    if (!newMessage.trim() || !selectedConv) return;
    sendMutation.mutate(
      { conversationId: selectedConv, data: { content: newMessage } },
      {
        onSuccess: () => {
          setNewMessage("");
          queryClient.invalidateQueries({ queryKey: getGetMessagesQueryKey(selectedConv) });
          queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() });
        }
      }
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-0">
        <div className="flex h-[calc(100vh-4rem)] border border-border rounded-none overflow-hidden">
          {/* Conversations list */}
          <div className="w-full md:w-80 border-l border-border bg-card flex flex-col">
            <div className="p-4 border-b border-border">
              <h2 className="font-bold text-lg">الرسائل</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {convsLoading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
                </div>
              ) : !conversations?.length ? (
                <div className="text-center py-12 px-4">
                  <MessageCircle className="w-10 h-10 mx-auto mb-2 text-muted-foreground opacity-30" />
                  <p className="text-sm text-muted-foreground">لا توجد محادثات</p>
                </div>
              ) : (
                conversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConv(conv.id)}
                    className={cn(
                      "w-full text-right p-4 hover:bg-muted/50 transition-colors border-b border-border/50",
                      selectedConv === conv.id && "bg-primary/10 border-r-2 border-r-primary"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary">
                        {conv.otherPartyName?.charAt(0) || "م"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-medium text-sm truncate">{conv.otherPartyName || "مالك العقار"}</span>
                          {conv.unreadCount > 0 && (
                            <Badge className="bg-primary text-primary-foreground text-xs px-1.5 py-0 h-5 flex-shrink-0">
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">{conv.propertyTitle || ""}</div>
                        <div className="text-xs text-muted-foreground truncate mt-0.5">{conv.lastMessage}</div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-1 flex flex-col hidden md:flex">
            {!selectedConv ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-3 text-muted-foreground opacity-30" />
                  <p className="text-muted-foreground">اختر محادثة للبدء</p>
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="p-4 border-b border-border bg-card flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-sm">
                    {selectedConvData?.otherPartyName?.charAt(0) || "م"}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{selectedConvData?.otherPartyName || "مالك العقار"}</div>
                    <div className="text-xs text-muted-foreground">{selectedConvData?.propertyTitle || ""}</div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background">
                  {msgsLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-xl" />)}
                    </div>
                  ) : messages?.map(msg => (
                    <div key={msg.id} className={cn("flex", msg.isOwn ? "justify-start" : "justify-end")}>
                      <div className={cn(
                        "max-w-xs px-4 py-2 rounded-2xl text-sm",
                        msg.isOwn
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-card border border-border text-foreground rounded-tl-sm"
                      )}>
                        {msg.content}
                        <div className={cn("text-xs mt-1 opacity-70", msg.isOwn ? "text-primary-foreground" : "text-muted-foreground")}>
                          {new Date(msg.createdAt).toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-border bg-card">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      placeholder="اكتب رسالتك..."
                      onKeyDown={e => e.key === "Enter" && handleSend()}
                      className="flex-1"
                    />
                    <Button onClick={handleSend} disabled={sendMutation.isPending || !newMessage.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
