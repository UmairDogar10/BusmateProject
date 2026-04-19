export type Bus = {
  id: string;
  name: string;
  route: string;
  eta: number;
  seatsAvailable: number;
  /** Matches `Route` document id in MongoDB for ETA/seat sync */
  routeId?: string;
  /** Fleet capacity upper bound for occupancy UI */
  totalSeats?: number;
  isLive: boolean;
  position: {
    x: number;
    y: number;
    lat: number;
    lng: number;
  };
};

export type NotificationType = "info" | "success" | "warning" | "error";

export type BusNotification = {
  id: string;
  message: string;
  type: NotificationType;
  createdAt: number;
};

export type User = {
  id: string;
  email: string;
  name: string;
  role: "student" | "driver" | "admin";
  studentId?: string;
  driverId?: string;
  isActive: boolean;
  createdAt: Date;
};

export type Route = {
  id: string;
  name: string;
  driver?: string;
  description?: string;
  stops: Array<{
    name: string;
    lat: number;
    lng: number;
    order: number;
  }>;
  isActive: boolean;
  createdAt: Date;
};
