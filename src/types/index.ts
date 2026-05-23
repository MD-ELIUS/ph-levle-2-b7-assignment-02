

export const USER_ROLE = {
    contributor: "contributor",
    maintainer: "maintainer"
    
} as const


export type ROLES = 'contributor' | 'maintainer' ;


export interface IUser {
    name: string ;
    email: string ;
    password: string ;
    role: ROLES ;

} 

 export interface AuthUser {
  id: number;
  email: string;
  role: "contributor" | "maintainer";
}

export const ISSUE_TYPE = {
    bug : "bug",
    feature_request: "feature_request"
} as const

export type  TYPES = 'bug' | 'feature_request' ;
export type STATUS = 'open' | 'in_progress' | 'resolved' ;

export interface IIssue {
    title: string ;
    description: string ;
    type: TYPES ;
    reporter_id: number ;
    status ? : STATUS
}

export interface IUpdateIssue {
  title?: string;
  description?: string;
  type?: TYPES;
  status?: STATUS;
}


export interface CustomError extends Error {
  statusCode?: number;
}

export interface IIssueQueryParams {
  sort?: string;
  type?: string;
  status?: string;
}