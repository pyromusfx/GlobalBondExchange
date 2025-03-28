import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { countries } from "@shared/countries";
import { Loader2 } from "lucide-react";

// KYC form schema
const kycFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  country: z.string().min(1, "Country is required"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  postalCode: z.string().min(1, "Postal code is required"),
  phoneNumber: z.string().min(5, "Phone number must be at least 5 characters"),
  idType: z.string().min(1, "ID type is required"),
  idNumber: z.string().min(3, "ID number must be at least 3 characters"),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

type KycFormValues = z.infer<typeof kycFormSchema>;

interface KycInfo {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  country: string;
  address: string;
  city: string;
  postalCode: string;
  phoneNumber: string;
  idType: string;
  idNumber: string;
  status: string;
  submittedAt: string;
}

export default function KycForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  
  // Get existing KYC information if any
  const { data: kycInfo, isLoading: isLoadingKyc } = useQuery<KycInfo>({
    queryKey: ['/api/kyc'],
    enabled: !!user,
  });
  
  // If KYC is already pending or approved, show status
  if (kycInfo && (kycInfo.status === "pending" || kycInfo.status === "approved")) {
    return (
      <div className="bg-card rounded-lg shadow-lg p-6 text-center">
        <div className="mb-4">
          {kycInfo.status === "pending" ? (
            <div className="h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          ) : (
            <div className="h-16 w-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          <h2 className="text-xl font-bold mb-2">
            {kycInfo.status === "pending" ? "KYC Verification Pending" : "KYC Verification Approved"}
          </h2>
          <p className="text-muted-foreground">
            {kycInfo.status === "pending"
              ? "Your verification is being processed. We'll notify you once it's complete."
              : "Your account has been successfully verified!"
            }
          </p>
        </div>
        
        <div className="mt-6">
          <Link href="/">
            <Button className="bg-primary text-secondary">Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  // Default form values
  const defaultValues: Partial<KycFormValues> = {
    firstName: kycInfo?.firstName || "",
    lastName: kycInfo?.lastName || "",
    dateOfBirth: kycInfo?.dateOfBirth || "",
    country: kycInfo?.country || "",
    address: kycInfo?.address || "",
    city: kycInfo?.city || "",
    postalCode: kycInfo?.postalCode || "",
    phoneNumber: kycInfo?.phoneNumber || "",
    idType: kycInfo?.idType || "",
    idNumber: kycInfo?.idNumber || "",
    termsAccepted: false,
  };
  
  // Form configuration
  const form = useForm<KycFormValues>({
    resolver: zodResolver(kycFormSchema),
    defaultValues,
  });
  
  // KYC submission mutation
  const kycMutation = useMutation({
    mutationFn: async (data: KycFormValues) => {
      const response = await apiRequest("POST", "/api/kyc", {
        ...data,
        userId: user?.id,
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "KYC submitted successfully",
        description: "Your verification request has been submitted and is being processed.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/kyc'] });
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "KYC submission failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Form submission handler
  const onSubmit = (data: KycFormValues) => {
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    
    kycMutation.mutate(data);
  };
  
  // Step titles and descriptions
  const stepInfo = [
    {
      title: "Personal Information",
      description: "Please provide your basic personal details for verification."
    },
    {
      title: "Address Information",
      description: "Enter your current residential address details."
    },
    {
      title: "Identity Verification",
      description: "Provide government-issued ID information to complete verification."
    }
  ];
  
  // Go to previous step
  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  if (isLoadingKyc) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-lg overflow-hidden">
      {/* Step indicator */}
      <div className="flex border-b border-border">
        {[1, 2, 3].map((num) => (
          <div 
            key={num}
            className={`flex-1 p-4 text-center ${
              num < step ? 'bg-primary/10' : num === step ? 'bg-primary/10' : ''
            } ${num < step + 1 ? 'border-r border-border' : ''}`}
          >
            <div 
              className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                num < step 
                  ? 'bg-green-500 text-secondary' 
                  : num === step 
                    ? 'bg-primary text-secondary' 
                    : 'bg-secondary text-muted-foreground'
              } font-bold text-sm mb-2`}
            >
              {num < step ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                num
              )}
            </div>
            <div className={num === step ? 'font-medium' : 'text-muted-foreground'}>
              {stepInfo[num - 1].title}
            </div>
          </div>
        ))}
      </div>
      
      {/* Form */}
      <div className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth*</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country of Residence*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem key={country.code} value={country.code}>
                                {country.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}
            
            {/* Step 2: Address Information */}
            {step === 2 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="col-span-full">
                        <FormLabel>Street Address*</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City*</FormLabel>
                        <FormControl>
                          <Input placeholder="New York" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code*</FormLabel>
                        <FormControl>
                          <Input placeholder="10001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem className="col-span-full">
                        <FormLabel>Phone Number*</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}
            
            {/* Step 3: Identity Verification */}
            {step === 3 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="idType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Type*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select ID type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="passport">Passport</SelectItem>
                            <SelectItem value="national_id">National ID</SelectItem>
                            <SelectItem value="drivers_license">Driver's License</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="idNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Number*</FormLabel>
                        <FormControl>
                          <Input placeholder="AB123456789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="termsAccepted"
                    render={({ field }) => (
                      <FormItem className="col-span-full flex flex-row items-start space-x-3 space-y-0 py-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I confirm that the information provided is accurate and I agree to the{" "}
                            <a href="#" className="text-primary hover:underline">Terms of Service</a>{" "}
                            and{" "}
                            <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="bg-secondary/30 p-4 rounded text-sm">
                  <p className="font-medium mb-2">Important Information:</p>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Your personal information is encrypted and securely stored.</li>
                    <li>KYC verification typically takes 1-3 business days.</li>
                    <li>You'll be notified once your verification is complete.</li>
                    <li>You can trade with limited features while verification is pending.</li>
                  </ul>
                </div>
              </>
            )}
            
            <div className="flex justify-between mt-6">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                >
                  Back
                </Button>
              ) : (
                <div>{/* Empty div for spacing */}</div>
              )}
              
              <Button
                type="submit"
                className={step === 3 ? "bg-primary text-secondary" : ""}
                disabled={kycMutation.isPending}
              >
                {kycMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing
                  </>
                ) : step < 3 ? (
                  "Continue"
                ) : (
                  "Submit Verification"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
