declare namespace Express {
    export interface Request {
      user: User;
    }
  
    export interface User {
      id: string;
      name: string;
      username: string;
      technologies: Technology[];
    }
  }
  