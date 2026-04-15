import { useState } from 'react';
import { Search, Package, MapPin, Clock, AlertCircle, Phone, MessageCircle, Star, Image as ImageIcon, Send, Map } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { findDeliveryByResi } from '../mockData';
import { Delivery } from '../types';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export function TrackingPage() {
  const [resiNumber, setResiNumber] = useState('');
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const handleSearch = () => {
    if (!resiNumber.trim()) {
      return;
    }

    setIsLoading(true);
    setNotFound(false);
    setDelivery(null);

    // Simulate loading
    setTimeout(() => {
      const result = findDeliveryByResi(resiNumber.trim());
      if (result) {
        setDelivery(result);
        setNotFound(false);
        setRating(result.courierRating || 0);
      } else {
        setDelivery(null);
        setNotFound(true);
      }
      setIsLoading(false);
    }, 800);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !delivery) return;

    toast.success('Pesan terkirim!', {
      description: 'Kurir akan segera membalas pesan Anda.',
    });
    setNewMessage('');
  };

  const handleSubmitRating = () => {
    if (rating === 0) {
      toast.error('Pilih rating terlebih dahulu');
      return;
    }

    setRatingSubmitted(true);
    toast.success('Terima kasih atas penilaian Anda!', {
      description: `Rating ${rating} bintang telah dikirim.`,
    });
  };

  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('terkirim')) return 'bg-green-500';
    if (lowerStatus.includes('pengiriman')) return 'bg-blue-500';
    if (lowerStatus.includes('proses') || lowerStatus.includes('sortir')) return 'bg-yellow-500';
    if (lowerStatus.includes('menunggu')) return 'bg-orange-500';
    return 'bg-gray-500';
  };

  const getStatusBadgeVariant = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('terkirim')) return 'default';
    if (lowerStatus.includes('pengiriman')) return 'secondary';
    return 'outline';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      {/* Header */}
      <section className="bg-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold mb-4">Track Your Package</h1>
            <p className="text-xl text-green-100 max-w-2xl">
              Enter your tracking number to see real-time updates on your shipment
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Enter your tracking number (e.g., CKL2026040001)"
                      value={resiNumber}
                      onChange={(e) => setResiNumber(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="pl-12 h-14 text-base"
                    />
                  </div>
                  <Button onClick={handleSearch} disabled={isLoading} size="lg" className="px-8">
                    {isLoading ? 'Searching...' : 'Track'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Not Found Message */}
          {notFound && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="mt-6"
            >
              <Card className="border-2 border-destructive/50 bg-destructive/5">
                <CardContent className="flex items-start gap-4 pt-6">
                  <AlertCircle className="h-6 w-6 text-destructive mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-destructive mb-1">Tracking Number Not Found</p>
                    <p className="text-sm text-muted-foreground">
                      Please check your tracking number and try again. Make sure you entered the correct number.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Delivery Info */}
          {delivery && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-8 space-y-6"
            >
              {/* Delivery Status Card */}
              <Card className="border-2 border-primary">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">Tracking: {delivery.resiNumber}</CardTitle>
                      <CardDescription className="text-base">
                        Estimated Delivery: {formatDate(delivery.estimatedDelivery)}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusBadgeVariant(delivery.currentStatus)} className="text-sm px-4 py-2">
                      {delivery.currentStatus}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Sender</p>
                      <p className="font-semibold text-lg">{delivery.senderName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Recipient</p>
                      <p className="font-semibold text-lg">{delivery.recipientName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-4">
                    <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                    <div className="flex-1">
                      <span className="font-semibold">{delivery.origin}</span>
                      <span className="text-muted-foreground mx-3">→</span>
                      <span className="font-semibold">{delivery.destination}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-muted-foreground" />
                    <span className="text-muted-foreground">Weight: {delivery.weight} kg</span>
                  </div>
                </CardContent>
              </Card>

              {/* Courier Info */}
              {delivery.courierName && (
                <Card className="bg-secondary/20 border-primary/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Your Courier</p>
                        <p className="font-semibold text-xl mb-2">{delivery.courierName}</p>
                        {delivery.courierRating && (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < Math.floor(delivery.courierRating!)
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'fill-gray-200 text-gray-200'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-medium">{delivery.courierRating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      <a href={`tel:${delivery.courierPhone}`}>
                        <Button size="lg" variant="outline" className="gap-2">
                          <Phone className="h-5 w-5" />
                          Contact
                        </Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tabs for History, Chat, Map */}
              <Tabs defaultValue="history" className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-12">
                  <TabsTrigger value="history" className="text-base">Transit History</TabsTrigger>
                  <TabsTrigger value="chat" className="text-base">
                    Chat
                    {delivery.chatMessages && delivery.chatMessages.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {delivery.chatMessages.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="map" className="text-base">Route Map</TabsTrigger>
                </TabsList>

                {/* History Timeline */}
                <TabsContent value="history">
                  <Card>
                    <CardHeader>
                      <CardTitle>Delivery History</CardTitle>
                      <CardDescription>Track your package journey from origin to destination</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        {delivery.historyLogs
                          .slice()
                          .reverse()
                          .map((log, index) => (
                            <div key={log.id} className="flex gap-6 pb-8 last:pb-0">
                              {/* Timeline dot and line */}
                              <div className="relative flex flex-col items-center">
                                <div
                                  className={`${getStatusColor(log.status)} h-4 w-4 rounded-full z-10 ring-4 ring-background`}
                                />
                                {index !== delivery.historyLogs.length - 1 && (
                                  <div className="w-0.5 h-full bg-border absolute top-4" />
                                )}
                              </div>

                              {/* Content */}
                              <div className="flex-1 -mt-1">
                                <div className="flex items-start justify-between mb-2">
                                  <p className="font-semibold text-lg">{log.status}</p>
                                  <Badge variant="outline" className="ml-4">
                                    {log.location}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {log.description}
                                </p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Clock className="h-4 w-4" />
                                  {formatDate(log.timestamp)}
                                </div>

                                {/* Photo Proof */}
                                {log.photoUrl && (
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="outline" size="sm" className="mt-3 gap-2">
                                        <ImageIcon className="h-4 w-4" />
                                        View Delivery Proof
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                      <DialogHeader>
                                        <DialogTitle>Delivery Proof</DialogTitle>
                                      </DialogHeader>
                                      <img
                                        src={log.photoUrl}
                                        alt="Delivery proof"
                                        className="w-full rounded-lg"
                                      />
                                      <p className="text-sm text-muted-foreground text-center">
                                        Photo taken on {formatDate(log.timestamp)}
                                      </p>
                                    </DialogContent>
                                  </Dialog>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Chat Tab */}
                <TabsContent value="chat">
                  <Card>
                    <CardHeader>
                      <CardTitle>Chat with Courier</CardTitle>
                      <CardDescription>
                        Direct communication with your courier
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Chat Messages */}
                      <div className="space-y-4 max-h-[400px] overflow-y-auto p-4 bg-muted/30 rounded-lg">
                        {delivery.chatMessages && delivery.chatMessages.length > 0 ? (
                          delivery.chatMessages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex ${msg.senderRole === 'pelanggan' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[70%] rounded-lg p-4 ${
                                  msg.senderRole === 'pelanggan'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-card border'
                                }`}
                              >
                                <p className="text-xs font-medium mb-1 opacity-80">{msg.senderName}</p>
                                <p className="text-sm">{msg.message}</p>
                                <p className="text-xs opacity-70 mt-2">{formatTime(msg.timestamp)}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-12 text-muted-foreground">
                            <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>No messages yet. Start a conversation with your courier!</p>
                          </div>
                        )}
                      </div>

                      {/* Message Input */}
                      <div className="flex gap-3 pt-4 border-t">
                        <Textarea
                          placeholder="Type your message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className="min-h-[80px]"
                        />
                        <Button onClick={handleSendMessage} size="icon" className="h-20 w-20 shrink-0">
                          <Send className="h-5 w-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Map Tab */}
                <TabsContent value="map">
                  <Card>
                    <CardHeader>
                      <CardTitle>Route Map</CardTitle>
                      <CardDescription>
                        Delivery route visualization
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Static Map Placeholder */}
                      <div className="bg-muted rounded-lg p-12 text-center space-y-6">
                        <Map className="h-20 w-20 mx-auto text-muted-foreground" />
                        <div>
                          <p className="font-semibold text-xl mb-2">Static Route Map</p>
                          <p className="text-muted-foreground">
                            {delivery.origin} → {delivery.destination}
                          </p>
                        </div>
                        <div className="bg-card border rounded-lg p-6 text-left space-y-3 max-w-md mx-auto">
                          <div className="flex items-center gap-3">
                            <div className="h-4 w-4 rounded-full bg-green-500" />
                            <span className="font-medium">Origin: {delivery.origin}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="h-4 w-4 rounded-full bg-blue-500" />
                            <span className="font-medium">Current: {delivery.historyLogs[delivery.historyLogs.length - 1]?.location}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="h-4 w-4 rounded-full bg-red-500" />
                            <span className="font-medium">Destination: {delivery.destination}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Rating Section (only for delivered packages) */}
              {delivery.currentStatus.toLowerCase().includes('terkirim') && (
                <Card className="border-2 border-yellow-500/50">
                  <CardHeader>
                    <CardTitle>Rate Your Courier</CardTitle>
                    <CardDescription>
                      Help us improve our service by rating your delivery experience
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex justify-center gap-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => !ratingSubmitted && setRating(star)}
                          disabled={ratingSubmitted}
                          className="transition-transform hover:scale-110 disabled:cursor-not-allowed"
                        >
                          <Star
                            className={`h-10 w-10 ${
                              star <= rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    {rating > 0 && !ratingSubmitted && (
                      <Button onClick={handleSubmitRating} size="lg" className="w-full">
                        Submit Rating
                      </Button>
                    )}
                    {ratingSubmitted && (
                      <p className="text-center text-lg text-primary font-semibold">
                        ✓ Thank you for your feedback!
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {/* Example Tracking Numbers */}
          {!delivery && !notFound && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-8"
            >
              <Card className="bg-secondary/30">
                <CardHeader>
                  <CardTitle className="text-lg">Try Sample Tracking Numbers</CardTitle>
                  <CardDescription>Click any number below to see a demo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setResiNumber('CKL2026040001')}
                    >
                      CKL2026040001
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setResiNumber('CKL2026040002')}
                    >
                      CKL2026040002
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setResiNumber('CKL2026040003')}
                    >
                      CKL2026040003
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
