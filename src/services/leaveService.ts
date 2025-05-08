
import { supabase } from "@/integrations/supabase/client";
import { LeaveRequest, LeaveQuota } from "@/types";

// Fetch leave requests for the current user
export async function fetchLeaveRequests(): Promise<LeaveRequest[]> {
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData.user) {
    console.error('No authenticated user found when fetching leave requests');
    throw new Error('User not authenticated');
  }
  
  const { data, error } = await supabase
    .from('leave_requests')
    .select('*')
    .eq('employee_id', userData.user.id)
    .order('requested_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching leave requests:', error);
    throw new Error('Failed to fetch leave requests');
  }

  return data.map(item => ({
    id: item.id,
    employeeId: item.employee_id,
    startDate: item.start_date,
    endDate: item.end_date,
    reason: item.reason,
    status: item.status as 'pending' | 'approved' | 'rejected',
    requestedAt: item.requested_at,
    reviewedBy: item.reviewed_by || undefined,
    reviewedAt: item.reviewed_at || undefined,
    reviewComment: item.review_comment || undefined,
  }));
}

// Fetch leave requests for managers (all requests)
export async function fetchAllLeaveRequests(): Promise<LeaveRequest[]> {
  try {
    // First get the profiles data separately
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name');
    
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw new Error('Failed to fetch employee profiles');
    }
    
    // Create a lookup map for quick access
    const profileMap = new Map();
    profilesData.forEach((profile: any) => {
      profileMap.set(profile.id, {
        firstName: profile.first_name || '',
        lastName: profile.last_name || ''
      });
    });
    
    // Now fetch all leave requests
    const { data, error } = await supabase
      .from('leave_requests')
      .select('*')
      .order('requested_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching all leave requests:', error);
      throw new Error('Failed to fetch leave requests');
    }

    console.log('Leave requests data:', data); // Add logging to check data

    return data.map(item => {
      const profile = profileMap.get(item.employee_id);
      const employeeName = profile 
        ? `${profile.firstName} ${profile.lastName}`.trim() || 'Unknown'
        : 'Unknown';
      
      return {
        id: item.id,
        employeeId: item.employee_id,
        employeeName,
        startDate: item.start_date,
        endDate: item.end_date,
        reason: item.reason,
        status: item.status as 'pending' | 'approved' | 'rejected',
        requestedAt: item.requested_at,
        reviewedBy: item.reviewed_by || undefined,
        reviewedAt: item.reviewed_at || undefined,
        reviewComment: item.review_comment || undefined,
      };
    });
  } catch (error) {
    console.error('Error in fetchAllLeaveRequests:', error);
    return []; // Return empty array instead of throwing to prevent UI crashes
  }
}

// Fetch leave quota for the current user
export async function fetchLeaveQuota(): Promise<LeaveQuota | null> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      console.error('No authenticated user found when fetching leave quota');
      throw new Error('User not authenticated');
    }
    
    const currentYear = new Date().getFullYear();
    
    const { data, error } = await supabase
      .from('leave_quotas')
      .select('*')
      .eq('employee_id', userData.user.id)
      .eq('year', currentYear)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No data found
        console.warn('No leave quota found for current year');
        return null;
      }
      console.error('Error fetching leave quota:', error);
      throw new Error('Failed to fetch leave quota');
    }

    return {
      id: data.id,
      employeeId: data.employee_id,
      year: data.year,
      totalDays: data.total_days,
      usedDays: data.used_days,
      remainingDays: data.remaining_days || data.total_days - data.used_days,
    };
  } catch (error) {
    console.error('Error in fetchLeaveQuota:', error);
    return null; // Return null instead of throwing to prevent UI crashes
  }
}

// Create a new leave request
export async function createLeaveRequest(request: {
  startDate: string;
  endDate: string;
  reason: string;
}): Promise<LeaveRequest> {
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData.user) {
    throw new Error('User not authenticated');
  }
  
  const { data, error } = await supabase
    .from('leave_requests')
    .insert({
      employee_id: userData.user.id,
      start_date: request.startDate,
      end_date: request.endDate,
      reason: request.reason,
      status: 'pending'
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating leave request:', error);
    throw new Error('Failed to create leave request');
  }

  return {
    id: data.id,
    employeeId: data.employee_id,
    startDate: data.start_date,
    endDate: data.end_date,
    reason: data.reason,
    status: data.status as 'pending' | 'approved' | 'rejected',
    requestedAt: data.requested_at,
    reviewedBy: data.reviewed_by || undefined,
    reviewedAt: data.reviewed_at || undefined,
    reviewComment: data.review_comment || undefined,
  };
}

// Update a leave request (for managers/admins)
export async function updateLeaveRequestStatus(
  requestId: string, 
  status: 'approved' | 'rejected', 
  comment?: string
): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData.user) {
    throw new Error('User not authenticated');
  }
  
  const updateData: any = {
    status,
    reviewed_at: new Date().toISOString(),
    reviewed_by: userData.user.id,
  };
  
  if (comment) {
    updateData.review_comment = comment;
  }
  
  const { error } = await supabase
    .from('leave_requests')
    .update(updateData)
    .eq('id', requestId);
  
  if (error) {
    console.error('Error updating leave request:', error);
    throw new Error('Failed to update leave request');
  }
}
