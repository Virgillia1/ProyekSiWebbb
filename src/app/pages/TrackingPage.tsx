import { useState } from 'react';
import {
  Search,
  Package,
  MapPin,
  Clock,
  AlertCircle,
  Phone,
  Star,
  Image as ImageIcon,
  Map,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { findDeliveryByResi } from '../mockData';
import { Delivery } from '../types';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export function TrackingPage() {
  const [resiNumber, setResiNumber] = useState('');
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const handleSearch = () => {
    if (!resiNumber.trim()) {
      return;
    }

    setIsLoading(true);
    setNotFound(false);
    setDelivery(null);

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

  return (
    <div>
      <section className="bg-primary py-20 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="mb-4 text-5xl font-bold">Track Your Package</h1>
            <p className="max-w-2xl text-xl text-green-100">
              Enter your tracking number to see real-time updates on your shipment
            </p>
          </motion.div>
        </div>
      </section>

      <section className="bg-background py-16">
        <div className="mx-auto max-w-4xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Enter your tracking number (e.g., CKL2026040001)"
                      value={resiNumber}
                      onChange={(e) => setResiNumber(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="h-14 pl-12 text-base"
                    />
                  </div>
                  <Button onClick={handleSearch} disabled={isLoading} size="lg" className="px-8">
                    {isLoading ? 'Searching...' : 'Track'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {notFound && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="mt-6"
            >
              <Card className="border-2 border-destructive/50 bg-destructive/5">
                <CardContent className="flex items-start gap-4 pt-6">
                  <AlertCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-destructive" />
                  <div>
                    <p className="mb-1 font-semibold text-destructive">Tracking Number Not Found</p>
                    <p className="text-sm text-muted-foreground">
                      Please check your tracking number and try again. Make sure you entered the correct number.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {delivery && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-8 space-y-6"
            >
              <Card className="border-2 border-primary">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="mb-2 text-2xl">Tracking: {delivery.resiNumber}</CardTitle>
                      <CardDescription className="text-base">
                        Estimated Delivery: {formatDate(delivery.estimatedDelivery)}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusBadgeVariant(delivery.currentStatus)} className="px-4 py-2 text-sm">
                      {delivery.currentStatus}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <p className="mb-1 text-sm text-muted-foreground">Sender</p>
                      <p className="text-lg font-semibold">{delivery.senderName}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-sm text-muted-foreground">Recipient</p>
                      <p className="text-lg font-semibold">{delivery.recipientName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
                    <MapPin className="h-5 w-5 flex-shrink-0 text-primary" />
                    <div className="flex-1">
                      <span className="font-semibold">{delivery.origin}</span>
                      <span className="mx-3 text-muted-foreground">→</span>
                      <span className="font-semibold">{delivery.destination}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-muted-foreground" />
                    <span className="text-muted-foreground">Weight: {delivery.weight} kg</span>
                  </div>
                </CardContent>
              </Card>

              {delivery.courierName && (
                <Card className="border-primary/30 bg-secondary/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="mb-1 text-sm text-muted-foreground">Your Courier</p>
                        <p className="mb-2 text-xl font-semibold">{delivery.courierName}</p>
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

              <Tabs defaultValue="history" className="w-full">
                <TabsList className="grid h-12 w-full grid-cols-2">
                  <TabsTrigger value="history" className="text-base">
                    Transit History
                  </TabsTrigger>
                  <TabsTrigger value="map" className="text-base">
                    Route Map
                  </TabsTrigger>
                </TabsList>

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
                              <div className="relative flex flex-col items-center">
                                <div
                                  className={`${getStatusColor(log.status)} z-10 h-4 w-4 rounded-full ring-4 ring-background`}
                                />
                                {index !== delivery.historyLogs.length - 1 && (
                                  <div className="absolute top-4 h-full w-0.5 bg-border" />
                                )}
                              </div>

                              <div className="-mt-1 flex-1">
                                <div className="mb-2 flex items-start justify-between">
                                  <p className="text-lg font-semibold">{log.status}</p>
                                  <Badge variant="outline" className="ml-4">
                                    {log.location}
                                  </Badge>
                                </div>
                                <p className="mb-2 text-sm text-muted-foreground">{log.description}</p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Clock className="h-4 w-4" />
                                  {formatDate(log.timestamp)}
                                </div>

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
                                      <p className="text-center text-sm text-muted-foreground">
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

                <TabsContent value="map">
                  <Card>
                    <CardHeader>
                      <CardTitle>Route Map</CardTitle>
                      <CardDescription>Delivery route visualization</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6 rounded-lg bg-muted p-12 text-center">
                        <Map className="mx-auto h-20 w-20 text-muted-foreground" />
                        <div>
                          <p className="mb-2 text-xl font-semibold">Static Route Map</p>
                          <p className="text-muted-foreground">
                            {delivery.origin} → {delivery.destination}
                          </p>
                        </div>
                        <div className="mx-auto max-w-md space-y-3 rounded-lg border bg-card p-6 text-left">
                          <div className="flex items-center gap-3">
                            <div className="h-4 w-4 rounded-full bg-green-500" />
                            <span className="font-medium">Origin: {delivery.origin}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="h-4 w-4 rounded-full bg-blue-500" />
                            <span className="font-medium">
                              Current: {delivery.historyLogs[delivery.historyLogs.length - 1]?.location}
                            </span>
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
                              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
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
                      <p className="text-center text-lg font-semibold text-primary">
                        ✓ Thank you for your feedback!
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

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
                    <Button variant="outline" onClick={() => setResiNumber('CKL2026040001')}>
                      CKL2026040001
                    </Button>
                    <Button variant="outline" onClick={() => setResiNumber('CKL2026040002')}>
                      CKL2026040002
                    </Button>
                    <Button variant="outline" onClick={() => setResiNumber('CKL2026040003')}>
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
