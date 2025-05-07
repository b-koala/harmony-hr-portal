
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { mockCreateLeaveRequest } from '@/data/mockData';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { format, addDays, differenceInDays, isWeekend } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

// Calculate minimum date (14 days from now)
const minDate = addDays(new Date(), 14);

// Create form schema with validation
const formSchema = z.object({
  startDate: z.date({
    required_error: 'Start date is required',
  }).refine((date) => {
    return differenceInDays(date, new Date()) >= 14;
  }, 'Start date must be at least 14 days from now'),
  endDate: z.date({
    required_error: 'End date is required',
  }),
  reason: z.string().min(5, {
    message: 'Reason must be at least 5 characters',
  }).max(300, {
    message: 'Reason must be less than 300 characters',
  }),
}).refine((data) => {
  return data.endDate >= data.startDate;
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

type FormValues = z.infer<typeof formSchema>;

const LeaveRequestForm: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Create form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  // Calculate business days between dates (excluding weekends)
  const calculateBusinessDays = (startDate: Date, endDate: Date): number => {
    let count = 0;
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return count;
  };

  // Calculated fields based on form values
  const startDate = form.watch('startDate');
  const endDate = form.watch('endDate');
  const businessDays = startDate && endDate ? calculateBusinessDays(startDate, endDate) : 0;

  const onSubmit = async (data: FormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      await mockCreateLeaveRequest({
        employeeId: user.id,
        startDate: format(data.startDate, 'yyyy-MM-dd'),
        endDate: format(data.endDate, 'yyyy-MM-dd'),
        reason: data.reason,
      });
      
      toast({
        title: 'Leave request submitted',
        description: 'Your leave request has been submitted successfully.',
      });
      
      // Reset form
      form.reset();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Submission failed',
        description: 'There was an error submitting your leave request.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Request Leave</h2>
        <p className="text-muted-foreground">Submit a new leave request</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < minDate || isWeekend(date)}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => (startDate ? date < startDate : true) || isWeekend(date)}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {startDate && endDate && (
            <div className="bg-muted/50 p-3 rounded-md">
              <p className="text-sm font-medium">
                Duration: {businessDays} business day{businessDays !== 1 && 's'}
              </p>
            </div>
          )}
          
          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reason for Leave</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Please provide the reason for your leave request"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default LeaveRequestForm;
