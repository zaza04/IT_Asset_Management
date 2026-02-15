export interface EndUser {
    id: string;
    user_id: string;
    device_id: string | null;
    full_name: string;
    email: string | null;
    phone: string | null;
    department: string | null;
    department_id: string | null;
    position: string | null;
    position_id: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface EndUserWithDevice extends EndUser {
    device_name: string | null;
    device_type: string | null;
}

export interface EndUserInsert {
    user_id?: string;
    full_name: string;
    email?: string;
    phone?: string;
    department_id?: string;
    department?: string;
    position_id?: string;
    position?: string;
    notes?: string;
    device_id?: string;
}

export interface EndUserUpdate {
    full_name?: string;
    email?: string;
    phone?: string;
    department_id?: string | null;
    department?: string | null;
    position_id?: string | null;
    position?: string | null;
    notes?: string;
    device_id?: string | null;
}
