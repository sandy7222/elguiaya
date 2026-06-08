/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sources?: Array<{ title: string; url: string }>;
}

export interface Coordinates {
  lat: number;
  lng: number;
  name: string;
}

export interface RoutePoint {
  x: number;
  y: number;
}

export interface Bid {
  id: string;
  captainName: string;
  rating: number;
  avatar: string;
  boatName: string;
  model: string;
  price: number;
  durationHours: number;
  distanceKm: number;
  included: string[];
  status: 'pending' | 'accepted' | 'rejected';
}

export interface PreRegisterInput {
  name: string;
  email: string;
  role: 'pescador' | 'capitan' | 'ambos';
  location: string;
  experience?: string;
  boatInfo?: string;
}
