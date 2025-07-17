// component.tsx
import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as DialogPrimitive from "@radix-ui/react-dialog";

// --- Utility Function & Radix Primitives (Unchanged) ---
type ClassValue = string | number | boolean | null | undefined;
function cn(...inputs: ClassValue[]): string { return inputs.filter(Boolean).join(" "); }
const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;
const TooltipContent = React.forwardRef<React.ElementRef<typeof TooltipPrimitive.Content>, React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & { showArrow?: boolean }>(({ className, sideOffset = 4, showArrow = false, ...props }, ref) => ( <TooltipPrimitive.Portal><TooltipPrimitive.Content ref={ref} sideOffset={sideOffset} className={cn("relative z-50 max-w-[280px] rounded-md bg-popover text-popover-foreground px-1.5 py-1 text-xs animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className)} {...props}>{props.children}{showArrow && <TooltipPrimitive.Arrow className="-my-px fill-popover" />}</TooltipPrimitive.Content></TooltipPrimitive.Portal>));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;
const Dialog = DialogPrimitive.Root;
const DialogPortal = DialogPrimitive.Portal;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogOverlay = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Overlay>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>>(({ className, ...props }, ref) => ( <DialogPrimitive.Overlay ref={ref} className={cn("fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className)} {...props} />));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;
const DialogContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>>(({ className, children, ...props }, ref) => ( <DialogPortal><DialogOverlay /><DialogPrimitive.Content ref={ref} className={cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-[90vw] md:max-w-[800px] translate-x-[-50%] translate-y-[-50%] gap-4 border-none bg-transparent p-0 shadow-none duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95", className)} {...props}><div className="relative bg-card dark:bg-[#303030] rounded-[28px] overflow-hidden shadow-2xl p-1">{children}<DialogPrimitive.Close className="absolute right-3 top-3 z-10 rounded-full bg-background/50 dark:bg-[#303030] p-1 hover:bg-accent dark:hover:bg-[#515151] transition-all"><XIcon className="h-5 w-5 text-muted-foreground dark:text-gray-200 hover:text-foreground dark:hover:text-white" /><span className="sr-only">Close</span></DialogPrimitive.Close></div></DialogPrimitive.Content></DialogPortal>));
DialogContent.displayName = DialogPrimitive.Content.displayName;

// --- SVG Icon Components ---
const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}> <path d="M12 5V19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/> <path d="M5 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/> </svg> );
const SendIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}> <path d="M12 5.25L12 18.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /> <path d="M18.75 12L12 5.25L5.25 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /> </svg> );
const XIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}> <line x1="18" y1="6" x2="6" y2="18" /> <line x1="6" y1="6" x2="18" y2="18" /> </svg> );
const MicIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}> <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path> <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path> <line x1="12" y1="19" x2="12" y2="23"></line> </svg> );

interface PromptBoxProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onSendMessage?: (message: string, file?: File) => void;
  onVoiceToggle?: () => void;
  isListening?: boolean;
}

// --- The Final, Self-Contained PromptBox Component ---
export const PromptBox = React.forwardRef<HTMLTextAreaElement, PromptBoxProps>(
  ({ className, onSendMessage, onVoiceToggle, isListening, value: controlledValue, onChange, ...props }, ref) => {
    const internalTextareaRef = React.useRef<HTMLTextAreaElement>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [internalValue, setInternalValue] = React.useState("");
    
    // Use controlled value if provided, otherwise use internal state
    const value = controlledValue !== undefined ? controlledValue : internalValue;
    const setValue = controlledValue !== undefined ? 
      (newValue: string) => onChange?.({ target: { value: newValue } } as React.ChangeEvent<HTMLTextAreaElement>) : 
      setInternalValue;
    const [imagePreview, setImagePreview] = React.useState<string | null>(null);
    const [isImageDialogOpen, setIsImageDialogOpen] = React.useState(false);
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
    
    React.useImperativeHandle(ref, () => internalTextareaRef.current!, []);
    
    React.useLayoutEffect(() => { 
      const textarea = internalTextareaRef.current; 
      if (textarea) { 
        textarea.style.height = "auto"; 
        const newHeight = Math.min(textarea.scrollHeight, 100); 
        textarea.style.height = `${newHeight}px`; 
      } 
    }, [value]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => { 
      if (controlledValue !== undefined) {
        // Controlled mode - call the external onChange
        onChange?.(e);
      } else {
        // Uncontrolled mode - update internal state
        setInternalValue(e.target.value);
      }
    };
    
    const handlePlusClick = () => { 
      fileInputRef.current?.click(); 
    };
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => { 
      const file = event.target.files?.[0]; 
      if (file && file.type.startsWith("image/")) { 
        setSelectedFile(file);
        const reader = new FileReader(); 
        reader.onloadend = () => { 
          setImagePreview(reader.result as string); 
        }; 
        reader.readAsDataURL(file); 
      } 
      event.target.value = ""; 
    };
    
    const handleRemoveImage = (e: React.MouseEvent<HTMLButtonElement>) => { 
      e.stopPropagation(); 
      setImagePreview(null); 
      setSelectedFile(null);
      if(fileInputRef.current) { 
        fileInputRef.current.value = ""; 
      } 
    };

    const handleSend = () => {
      if (value.trim() || selectedFile) {
        onSendMessage?.(value, selectedFile || undefined);
        setValue("");
        setImagePreview(null);
        setSelectedFile(null);
        if(fileInputRef.current) { 
          fileInputRef.current.value = ""; 
        }
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    };
    
    const hasValue = value.trim().length > 0 || imagePreview;

    return (
      <div className={cn("flex items-center rounded-full px-4 py-2 shadow-lg transition-all duration-200 bg-white/95 backdrop-blur-sm border border-gray-200/50 hover:shadow-xl focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-300/50", className)} dir="rtl">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*"/>
        
        {imagePreview && ( 
          <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}> 
            <div className="relative mr-2 flex-shrink-0"> 
              <button type="button" className="transition-transform" onClick={() => setIsImageDialogOpen(true)}> 
                <img src={imagePreview} alt="معاينة الصورة" className="h-8 w-8 rounded-lg object-cover" /> 
              </button> 
              <button onClick={handleRemoveImage} className="absolute -top-1 -left-1 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-600" aria-label="إزالة الصورة"> 
                <XIcon className="h-3 w-3" /> 
              </button> 
            </div> 
            <DialogContent> 
              <img src={imagePreview} alt="معاينة كاملة" className="w-full max-h-[95vh] object-contain rounded-[24px]" /> 
            </DialogContent> 
          </Dialog> 
        )}
        
        <textarea 
          ref={internalTextareaRef} 
          rows={1} 
          value={value} 
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="اكتب هنا..." 
          className="flex-1 resize-none border-0 bg-transparent px-2 py-1 text-gray-700 placeholder:text-gray-400/50 focus:ring-0 focus-visible:outline-none text-sm leading-tight max-h-[80px] overflow-y-auto" 
          {...props} 
        />
        
        <div className="flex items-center gap-2 ml-2">
          <TooltipProvider delayDuration={100}>
            <Tooltip> 
              <TooltipTrigger asChild>
                <button type="button" onClick={handlePlusClick} className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-all duration-200 hover:bg-orange-50 hover:text-orange-600 focus-visible:outline-none">
                  <PlusIcon className="h-4 w-4" />
                  <span className="sr-only">إرفاق صورة</span>
                </button>
              </TooltipTrigger> 
              <TooltipContent side="top" showArrow={true}><p>إرفاق صورة</p></TooltipContent> 
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  type="button" 
                  onClick={onVoiceToggle}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 focus-visible:outline-none",
                    isListening 
                      ? "bg-red-50 text-red-600 hover:bg-red-100" 
                      : "text-gray-500 hover:bg-orange-50 hover:text-orange-600"
                  )}
                >
                  <MicIcon className="h-4 w-4" />
                  <span className="sr-only">تسجيل صوتي</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" showArrow={true}><p>تسجيل صوتي</p></TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  type="button" 
                  onClick={handleSend}
                  disabled={!hasValue} 
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none",
                    hasValue 
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-md hover:shadow-lg" 
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  )}
                >
                  <SendIcon className="h-4 w-4" />
                  <span className="sr-only">إرسال الرسالة</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" showArrow={true}><p>إرسال</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    );
  }
);
PromptBox.displayName = "PromptBox";