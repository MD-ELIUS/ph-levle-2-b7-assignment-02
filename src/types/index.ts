

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

 

export const ISSUE_TYPE = {
    bug : "bug",
    feature_request: "feature_request"
} as const

export type  TYPES = 'bug' | 'feature_request'

export interface IIssue {
    title: string ;
    description: string ;
    type: TYPES ;
    reporter_id: number ;
}