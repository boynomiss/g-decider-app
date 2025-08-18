import * as React from 'react';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking, Alert, ScrollView, Dimensions, LayoutChangeEvent } from 'react-native';
import { Phone, Globe, Star, MapPin, Clock, Trash } from 'lucide-react-native';
import { ResultActionBar } from '@/components/results/ResultActionBar';
import { PlaceMoodData as PlaceData } from '../types';
import { useAIDescription } from '../hooks/use-ai-description';
import { AIDescriptionCard } from './AIDescriptionCard';

const { width: screenWidth } = Dimensions.get('window');

interface EnhancedPlaceCardProps {
  place: PlaceData;
  onPress?: () => void;
  onSave?: () => void;
  onRemove?: () => void;
  onPass?: () => void;
  onRestart?: () => void;
  isSaved?: boolean;
  showFullDetails?: boolean;
  showRemoveButton?: boolean;
}

export default function EnhancedPlaceCard({
  place,
  onPress,
  onSave,
  onRemove,
  onPass,
  onRestart,
  isSaved = false,
  showFullDetails = false,
  showRemoveButton = false
}: EnhancedPlaceCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number>(Math.max(320, screenWidth - 40));
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});
  const { aiDescription, isLoading: isAIDescriptionLoading, error: aiDescriptionError, generateDescription, clearDescription } = useAIDescription();

  const onContainerLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w && Math.abs(w - containerWidth) > 1) {
      setContainerWidth(w);
    }
  }, [containerWidth]);

  const imageSources: string[] = useMemo(() => {
    const photos = (place.photos?.medium && Array.isArray(place.photos.medium) ? place.photos.medium : []) as string[];
    const legacy = (place.images && Array.isArray(place.images) ? place.images : []) as string[];
    const merged = photos.length > 0 ? photos : legacy;
    return merged.filter((u) => typeof u === 'string' && u.length > 0);
  }, [place.photos?.medium, place.images]);

  useEffect(() => {
    console.log('[EnhancedPlaceCard] generating AI description for place:', place?.name);
    generateDescription(place as unknown as any);
    return () => {
      clearDescription();
    };
  }, [place, generateDescription, clearDescription]);

  const handleImageScroll = (event: { nativeEvent: { layoutMeasurement: { width: number }; contentOffset: { x: number } } }) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width || containerWidth;
    const total = imageSources.length;
    const index = slideSize > 0 ? event.nativeEvent.contentOffset.x / slideSize : 0;
    const rounded = Math.round(index);
    setCurrentImageIndex(Math.max(0, Math.min(total > 0 ? total - 1 : 0, rounded)));
  };

  const handleCall = async () => {
    if (!place.contactActions || !place.contactActions.canCall || !place.contactActions.callUrl) {
      Alert.alert('No Phone Number', "This place doesn't have a phone number available.");
      return;
    }

    try {
      const supported = await Linking.canOpenURL(place.contactActions.callUrl);
      if (supported) {
        await Linking.openURL(place.contactActions.callUrl);
      } else {
        Alert.alert('Cannot Make Call', "Your device doesn't support making calls.");
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to make call.');
    }
  };

  const handleWebsite = async () => {
    if (!place.contactActions || !place.contactActions.canVisitWebsite || !place.contactActions.websiteUrl) {
      Alert.alert('No Website', "This place doesn't have a website available.");
      return;
    }

    try {
      const supported = await Linking.canOpenURL(place.contactActions.websiteUrl);
      if (supported) {
        await Linking.openURL(place.contactActions.websiteUrl);
      } else {
        Alert.alert('Cannot Open Website', 'Failed to open website.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open website.');
    }
  };

  const getMoodDisplay = () => {
    const finalMood = (place as any).final_mood || place.mood || 'neutral';
    const moodLower = String(finalMood).toLowerCase();
    const hypeKeys = ['vibrant', 'lively', 'energetic', 'exciting', 'buzzing', 'dynamic', 'thrilling', 'electric', 'pumping', 'hype'];
    const chillKeys = ['cozy', 'peaceful', 'calm', 'serene', 'tranquil', 'relaxing', 'intimate', 'romantic', 'charming', 'quaint', 'rustic', 'homely', 'comfortable', 'welcoming', 'warm', 'gentle', 'soft', 'mellow', 'laid-back', 'casual', 'unpretentious', 'simple', 'minimalist', 'chill'];
    if (hypeKeys.some(k => moodLower.includes(k))) return { emoji: '🔥', label: 'Lively Atmosphere' };
    if (chillKeys.some(k => moodLower.includes(k))) return { emoji: '😌', label: 'Chill Vibe' };
    return { emoji: '😊', label: 'Balanced' };
  };

  const getOpeningHoursDisplay = () => {
    try {
      const src = place.openHours ?? '';
      if (!src || typeof src !== 'string') return null as null | { isOpenNow: boolean; label: string };

      const now = new Date();
      const toMinutes = (d: Date) => d.getHours() * 60 + d.getMinutes();

      const normalize = (s: string) => s.replace(/[\u2013\u2014]/g, '-').replace(/⋅/g, ' ').replace(/–/g, '-');
      const str = normalize(src).toLowerCase();

      const parseTime = (t: string): { h: number; m: number } | null => {
        const r12 = /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i;
        const r24 = /^(\d{1,2})(?::(\d{2}))?$/;
        let m: RegExpMatchArray | null = t.match(r12);
        if (m) {
          let h = parseInt(m[1] ?? '0', 10);
          const mm = parseInt(m[2] ?? '0', 10);
          const ap = (m[3] ?? '').toLowerCase();
          if (ap === 'pm' && h < 12) h += 12;
          if (ap === 'am' && h === 12) h = 0;
          return { h, m: mm };
        }
        m = t.match(r24);
        if (m) {
          let h = parseInt(m[1] ?? '0', 10);
          const mm = parseInt(m[2] ?? '0', 10);
          if (h >= 0 && h < 24 && mm >= 0 && mm < 60) return { h, m: mm };
        }
        return null;
      };

      const extractTimes = (s: string): Array<{ start: { h: number; m: number }; end: { h: number; m: number } }> => {
        const parts = s
          .split(/[,&;]|\band\b|\//g)
          .map(p => p.trim())
          .filter(Boolean);
        const times: Array<{ start: { h: number; m: number }; end: { h: number; m: number } }> = [];
        for (const p of parts) {
          const segment = p.replace(/hours?|open|opening|closed|closes|until|from|to|today|now|tomorrow/gi, ' ').replace(/\s+/g, ' ').trim();
          const range = segment.split('-').map(x => x.trim());
          if (range.length >= 2) {
            const a = parseTime(range[0] ?? '');
            const b = parseTime(range[1] ?? '');
            if (a && b) times.push({ start: a, end: b });
          } else {
            const m = segment.match(/(\d{1,2}(:\d{2})?\s*(am|pm)?)/gi);
            if (m && m.length >= 2) {
              const a = parseTime(m[0] ?? '');
              const b = parseTime(m[1] ?? '');
              if (a && b) times.push({ start: a, end: b });
            }
          }
        }
        if (times.length === 0) {
          const m = s.match(/(\d{1,2}(:\d{2})?\s*(am|pm)?)/gi);
          if (m && m.length >= 2) {
            const a = parseTime(m[0] ?? '');
            const b = parseTime(m[1] ?? '');
            if (a && b) times.push({ start: a, end: b });
          }
        }
        return times;
      };

      const intervals = extractTimes(str).map(({ start, end }) => {
        const s = new Date(now);
        s.setHours(start.h, start.m, 0, 0);
        const e = new Date(now);
        e.setHours(end.h, end.m, 0, 0);
        // Overnight handling
        if (toMinutes(e) <= toMinutes(s)) e.setDate(e.getDate() + 1);
        return { start: s, end: e };
      });

      if (intervals.length === 0) return null;

      const n = now.getTime();
      const inInterval = intervals.find(iv => n >= iv.start.getTime() && n < iv.end.getTime());
      const to12h = (d: Date) => {
        let h = d.getHours();
        const m2 = d.getMinutes();
        const ap = h >= 12 ? 'PM' : 'AM';
        h = h % 12; if (h === 0) h = 12;
        const mm = m2.toString().padStart(2, '0');
        return `${h}:${mm} ${ap}`;
      };

      if (inInterval) {
        return { isOpenNow: true, label: `Open until ${to12h(inInterval.end)}` };
      }

      const future = intervals
        .map(iv => (n < iv.start.getTime() ? iv.start : null))
        .filter((d): d is Date => !!d)
        .sort((a, b) => a.getTime() - b.getTime());

      if (future.length > 0) {
        const nextStart = future[0] as Date;
        return { isOpenNow: false, label: `Opens at ${to12h(nextStart)}` };
      }

      // If all intervals have passed today, show next day's first open
      const firstTomorrow = new Date(now);
      firstTomorrow.setDate(firstTomorrow.getDate() + 1);
      const firstInterval = intervals[0];
      if (!firstInterval) return null as null | { isOpenNow: boolean; label: string };
      const first = new Date(firstTomorrow);
      first.setHours(firstInterval.start.getHours(), firstInterval.start.getMinutes(), 0, 0);
      return { isOpenNow: false, label: `Opens at ${to12h(first)}` };
    } catch (e) {
      return null as null | { isOpenNow: boolean; label: string };
    }
  };

  const getBudgetDisplay = (): 'P' | 'PP' | 'PPP' => {
    const priceLevel = place.price_level;
    if (typeof priceLevel === 'number') {
      if (priceLevel <= 1) return 'P';
      if (priceLevel <= 2) return 'PP';
      return 'PPP';
    }
    const b = (place.budget ?? '') as string;
    if (b === 'P' || b === 'PP' || b === 'PPP') return b;
    return 'PP';
  };

  const moodDisplay = getMoodDisplay();

  const formatLocation = useCallback((formatted: string, vicinity: string) => {
    try {
      const source = (formatted && formatted.length > 0 ? formatted : vicinity) ?? '';
      if (!source) return 'Location not available';

      const cleaned = source
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
        .filter(s => {
          const l = s.toLowerCase();
          if (l === 'philippines') return false;
          if (l.includes('metro manila')) return false;
          if (l === 'ncr' || l.includes('national capital region') || l.includes('kalakhang maynila')) return false;
          return true;
        });

      const cityList = [
        'quezon city','makati','taguig','pasig','mandaluyong','san juan','manila','pasay','parañaque','paranaque','muntinlupa','marikina','valenzuela','caloocan','navotas','malabon','las piñas','las pinas'
      ];

      let city = '';
      for (let i = cleaned.length - 1; i >= 0; i--) {
        const part = cleaned[i];
        if (typeof part !== 'string') continue;
        const l = part.toLowerCase();
        if (l.includes(' city') || cityList.includes(l)) { city = part; break; }
      }
      if (!city && cleaned.length > 0) { const c = cleaned[cleaned.length - 1] ?? ''; city = typeof c === 'string' ? c : ''; }

      const mallKeywords = ['mall','center','centre','plaza','market','park','district','complex','galleria','arcade','square','town center','uptown','downtown','heights','estates'];
      const mallBrands = ['sm','ayala malls','robinsons','glorietta','greenbelt','festival','trinoma','uptown mall','shangri-la','power plant','market! market!','venice grand canal'];
      let venue = '';
      for (let i = 0; i < cleaned.length; i++) {
        const part = cleaned[i];
        if (typeof part !== 'string') continue;
        const l = part.toLowerCase();
        if (mallKeywords.some(k => l.includes(k)) || mallBrands.some(b => l.includes(b))) { venue = part; break; }
      }

      const brgyIndicators = ['barangay', 'brgy', 'brgy.', 'village', 'subdivision', 'estate'];
      const neighborhoodAliases = [
        'bgc','bonifacio global city','fort bonifacio','salcedo village','legazpi village','poblacion','san lorenzo','bel-air','urus','ugong','kapitolyo','bonifacio high street','greenhills','tomas morato','eastwood','ortigas center','newport city','mckinley hill','rockwell center'
      ];

      let barangay = '';
      // Heuristic: pick the part immediately before the city if not obviously a street/unit
      if (city) {
        const cityIdx = cleaned.findIndex(p => p === city);
        if (cityIdx > 0) {
          const candidate = cleaned[cityIdx - 1];
          if (typeof candidate === 'string') {
            const lc = candidate.toLowerCase();
            const looksStreet = /(street|st\.|road|rd\.|avenue|ave\.|blvd\.|floor|lvl|unit|building|bldg|tower|lot)/i.test(candidate);
            const isBarangayLike = brgyIndicators.some(k => lc.includes(k)) || neighborhoodAliases.some(n => lc.includes(n));
            if (!looksStreet) {
              if (isBarangayLike) barangay = candidate;
              else if (candidate.length <= 30) barangay = candidate;
            }
          }
        }
      }

      if (venue && city) return `${venue}, ${city}`;
      if (barangay && city) return `${barangay}, ${city}`;
      if (city) return city;
      return cleaned[0] ?? 'Location not available';
    } catch (e) {
      return 'Location not available';
    }
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.imageCardContainer}>
        <View style={styles.imageContainer} onLayout={onContainerLayout}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.imageScrollView}
            onScroll={handleImageScroll}
            onMomentumScrollEnd={handleImageScroll}
            scrollEventThrottle={16}
            testID="image-scrollview"
          >
            {imageSources.length > 0 ? (
              imageSources.map((photo, index) => (
                <View key={`photo-${index}`} style={[styles.imageWrapper, { width: containerWidth }]}> 
                  {failedImages[index] ? (
                    <View style={styles.placeholderImage}>
                      <Text style={styles.placeholderText}>Image unavailable</Text>
                    </View>
                  ) : (
                    <Image
                      source={{ uri: photo }}
                      style={styles.placeImage}
                      resizeMode="cover"
                      onError={() => setFailedImages((p) => ({ ...p, [index]: true }))}
                    />
                  )}
                </View>
              ))
            ) : (
              <View style={[styles.imageWrapper, { width: containerWidth }]}>
                <View style={styles.placeholderImage}>
                  <Text style={styles.placeholderText}>No Image Available</Text>
                </View>
              </View>
            )}
          </ScrollView>
          {imageSources.length > 1 && (
            <View style={styles.imageCounter} pointerEvents="box-none">
              <Text style={styles.imageCounterText}>
                {Math.min(currentImageIndex + 1, imageSources.length)}/{imageSources.length}
              </Text>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={styles.cardSectionContainer}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <View style={styles.placeInfo}>
          {(() => {
            const rawFormatted = formatLocation(place.formatted_address ?? '', place.vicinity ?? '');
            const cleanedLocation = rawFormatted === 'Location not available' ? '' : rawFormatted;
            const normalize = (str: string) => str.toLowerCase().replace(/[^\w\s]/g, '').trim();
            const formatSmart = (businessName: string, location: string): { displayName: string; displayLocation: string } => {
              if (!businessName || !location) return { displayName: businessName || '', displayLocation: location || '' };
              const locationParts = location.split(',').map(p => p.trim());
              const mainLocation = locationParts[0] ?? '';
              const additionalLocationInfo = locationParts.slice(1);
              const normalizedBusinessName = normalize(businessName);
              const normalizedMainLocation = normalize(mainLocation);
              const locationInBusinessName = normalizedBusinessName.includes(normalizedMainLocation) && normalizedMainLocation.length > 0;
              if (locationInBusinessName) {
                return {
                  displayName: businessName,
                  displayLocation: additionalLocationInfo.length > 0 ? additionalLocationInfo.join(', ') : ''
                };
              }
              return { displayName: businessName, displayLocation: location };
            };
            const smart = formatSmart(place.name ?? '', cleanedLocation);
            return (
              <>
                <View style={styles.nameRow}>
                  <Text style={styles.placeName} numberOfLines={2}>{smart.displayName}</Text>
                  {place.contactActions?.canVisitWebsite ? (
                    <TouchableOpacity
                      testID="website-inline-button"
                      accessibilityRole="button"
                      accessibilityLabel="Open website"
                      onPress={handleWebsite}
                      activeOpacity={0.7}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={styles.websiteInlineButton}
                    >
                      <Globe size={14} color="#8B5FBF" />
                    </TouchableOpacity>
                  ) : null}
                </View>
                {smart.displayLocation ? (
                  <Text style={styles.placeLocation}>{smart.displayLocation}</Text>
                ) : null}
              </>
            );
          })()}
          <View style={styles.budgetContainer}>
            <Text style={styles.budget}>
              {getBudgetDisplay().replace(/P/g, '₱')}
            </Text>
          </View>
          <View style={styles.enhancedInfoRow}>
            <View style={styles.ratingSection}>
              <Star size={14} color="#FFD700" fill="#FFD700" />
              <Text style={styles.ratingText}>
                {place.rating ? place.rating.toFixed(1) : 'N/A'}
              </Text>
            </View>
            <View style={styles.moodSection}>
              <Text style={styles.moodText}> 
                {moodDisplay.label}
              </Text>
            </View>
            {(() => {
              const hoursDisplay = getOpeningHoursDisplay();
              if (!hoursDisplay) return null;
              return (
                <View style={styles.hoursSection}>
                  <Clock size={14} color={hoursDisplay.isOpenNow ? '#4CAF50' : '#FF6B6B'} />
                  <Text style={[styles.hoursText, { color: hoursDisplay.isOpenNow ? '#4CAF50' : '#FF6B6B' }]} numberOfLines={1}>
                    {hoursDisplay.label}
                  </Text>
                </View>
              );
            })()}
          </View>

          <AIDescriptionCard
            description={aiDescription}
            isLoading={isAIDescriptionLoading}
            error={aiDescriptionError}
            onRetry={() => generateDescription(place as unknown as any)}
            onGenerate={() => generateDescription(place as unknown as any)}
            variant="inline"
          />

          <View style={styles.placeActions}>
            <TouchableOpacity 
              testID="maps-button"
              style={[
                styles.mapButton,
                (place.contactActions?.canCall ? styles.mapButtonFlex : styles.mapButtonFull)
              ]}
              onPress={() => {
                const url = `https://maps.google.com/?q=${encodeURIComponent(place.formatted_address || place.vicinity || '')}`;
                Linking.openURL(url);
              }}
              activeOpacity={0.7}
              accessibilityLabel="View in Maps"
              accessibilityRole="button"
            >
              <MapPin size={16} color="#8B5FBF" />
              <Text style={styles.mapButtonText} numberOfLines={1} ellipsizeMode="tail">View in Maps</Text>
            </TouchableOpacity>

            {place.contactActions && place.contactActions.canCall && (
              <TouchableOpacity 
                testID="contact-button"
                style={[styles.contactButton, styles.mapButtonFlex]}
                onPress={handleCall}
                activeOpacity={0.7}
                accessibilityLabel="Contact"
                accessibilityRole="button"
              >
                <Phone size={16} color="#FFFFFF" />
                <Text style={styles.contactButtonText} numberOfLines={1} ellipsizeMode="tail">Call</Text>
              </TouchableOpacity>
            )}

            {showRemoveButton && onRemove && (
              <TouchableOpacity 
                style={styles.removeButton} 
                onPress={onRemove}
                activeOpacity={0.7}
              >
                <Trash size={16} color="#FF6B6B" />
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.divider} />
          <ResultActionBar 
            onPass={onPass}
            onRestart={onRestart}
            onSave={onSave}
            isSaved={isSaved}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 8,
  },
  imageCardContainer: {
    backgroundColor: '#A67BCE',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 16,
  },
  cardSectionContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
    height: 240,
  },
  imageScrollView: {
    width: '100%',
    height: '100%',
  },
  imageWrapper: {
    height: '100%',
  },
  placeImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#9E9E9E',
    fontSize: 12,
    marginTop: 4,
  },
  imageCounter: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageCounterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  placeInfo: {
    padding: 20,
  },
  placeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A4A4A',
    marginBottom: 0,
    textAlign: 'center',
  },
  placeLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'nowrap',
    gap: 0 as const,
    marginBottom: 8,
  },
  websiteInlineButton: {
    marginLeft: 2,
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderRadius: 4,
  },
  budgetContainer: {
    alignSelf: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  budget: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  placeDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 14,
    color: '#4A4A4A',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  enhancedInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8 as const,
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#E6F3FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 0,
    marginRight: 0,
    height: 26,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A90E2',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  moodSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#E6F3FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 0,
    marginRight: 0,
    height: 26,
  },
  hoursSection: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#E6F3FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 0,
    marginRight: 0,
    height: 26,
  },
  hoursText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    color: '#4A90E2',
  },
  hoursDetail: {
    fontSize: 10,
    color: '#666',
    marginLeft: 4,
  },
  moodEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  moodText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A90E2',
  },
  moodScore: {
    fontSize: 10,
    color: '#999',
  },
  placeActions: {
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'stretch',
    marginTop: 16,
    gap: 8 as const,
  },
  actionButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4 as const,
    backgroundColor: 'transparent',
    flex: 1,
    minWidth: 0,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 40,
    borderWidth: 1,
    borderColor: '#4CAF50',
    marginLeft: 0,
  },
  actionText: {
    fontSize: 12,
    color: '#8B5FBF',
    fontWeight: '500',
    textAlign: 'center',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#8B5FBF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 0,
    minHeight: 40,
  },
  mapButtonFlex: {
    flex: 1,
  },
  mapButtonFull: {
    flex: 1,
    width: '100%',
    alignSelf: 'stretch',
    marginRight: 0,
  },
  mapButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5FBF',
    marginLeft: 8,
  },
  removeButton: {
    position: 'absolute',
    right: 0,
    top: -8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
    gap: 4 as const,
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
    textAlign: 'center',
  },
  removeText: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'transparent',
    minHeight: 52,
    borderRadius: 8,
    width: '100%',
  },
  passButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 4,
    paddingVertical: 8,
    borderRadius: 25,
  },
  restartButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 4,
    paddingVertical: 8,
    borderRadius: 25,
  },
  saveButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 4,
    paddingVertical: 8,
    borderRadius: 25,
  },
  savedButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 4,
    paddingVertical: 8,
    borderRadius: 25,
  },
});
