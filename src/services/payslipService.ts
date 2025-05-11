import { supabase } from "@/integrations/supabase/client";
import { Payslip } from "@/types";

// Fetch payslips for the current user
export async function fetchUserPayslips(month?: number, year?: number): Promise<Payslip[]> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      throw new Error('User not authenticated');
    }
    
    let query = supabase
      .from('payslips')
      .select('*')
      .eq('employee_id', userData.user.id)
      .order('year', { ascending: false })
      .order('month', { ascending: false });
    
    if (month) {
      query = query.eq('month', month);
    }
    
    if (year) {
      query = query.eq('year', year);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching payslips:', error);
      throw new Error('Failed to fetch payslips');
    }
    
    return data.map(item => ({
      id: item.id,
      employeeId: item.employee_id,
      month: item.month,
      year: item.year,
      documentUrl: item.document_url,
      uploadedAt: item.uploaded_at
    }));
  } catch (error) {
    console.error('Error in fetchUserPayslips:', error);
    return []; // Return empty array instead of throwing to prevent UI crashes
  }
}

// For managers/admins to fetch all payslips
export async function fetchAllPayslips(employeeId?: string, month?: number, year?: number): Promise<Payslip[]> {
  try {
    // First get user profiles for employee names
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
    
    // Build the query for payslips
    let query = supabase
      .from('payslips')
      .select('*')
      .order('year', { ascending: false })
      .order('month', { ascending: false });
    
    if (employeeId && employeeId !== 'all') {
      query = query.eq('employee_id', employeeId);
    }
    
    if (month && month !== 0) {
      query = query.eq('month', month);
    }
    
    if (year) {
      query = query.eq('year', year);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching all payslips:', error);
      throw new Error('Failed to fetch payslips');
    }
    
    return data.map(item => {
      const profile = profileMap.get(item.employee_id);
      const employeeName = profile 
        ? `${profile.firstName} ${profile.lastName}`.trim() || 'Unknown'
        : 'Unknown';
      
      return {
        id: item.id,
        employeeId: item.employee_id,
        employeeName,
        month: item.month,
        year: item.year,
        documentUrl: item.document_url,
        uploadedAt: item.uploaded_at
      };
    });
  } catch (error) {
    console.error('Error in fetchAllPayslips:', error);
    return []; // Return empty array instead of throwing to prevent UI crashes
  }
}

// For managers/admins to upload payslips
export async function uploadPayslip(file: File, employeeId: string, month: number, year: number): Promise<Payslip> {
  try {
    // 1. Upload file to Supabase Storage
    const filename = `${employeeId}/${year}-${month.toString().padStart(2, '0')}-payslip.pdf`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('payslips')
      .upload(filename, file, {
        upsert: true
      });
    
    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      throw new Error('Failed to upload payslip file');
    }
    
    // 2. Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('payslips')
      .getPublicUrl(filename);
    
    const documentUrl = publicUrlData.publicUrl;
    
    // 3. Insert record in payslips table
    const { data, error } = await supabase
      .from('payslips')
      .insert({
        employee_id: employeeId,
        month: month,
        year: year,
        document_url: documentUrl
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error inserting payslip record:', error);
      throw new Error('Failed to save payslip record');
    }
    
    return {
      id: data.id,
      employeeId: data.employee_id,
      month: data.month,
      year: data.year,
      documentUrl: data.document_url,
      uploadedAt: data.uploaded_at
    };
  } catch (error) {
    console.error('Error in uploadPayslip:', error);
    throw error;
  }
}

// Helper function to get month name
export function getMonthName(monthNumber: number): string {
  const months = [
    'January', 'February', 'March', 'April', 
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
  ];
  return months[monthNumber - 1];
}