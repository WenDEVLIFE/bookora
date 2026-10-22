"use client";

import {
  startTransition,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from "@/components/icons";
import { BookingFlowSkeleton } from "@/components/booking/booking-flow-skeleton";
import { BookingProgress } from "@/components/booking/booking-progress";
import { BookingSummary } from "@/components/booking/booking-summary";
import {
  BOOKING_STEPS,
  clearBookingDraft,
  createEmptyDraft,
  getBusinessTimeInput,
  isValidDateKey,
  LAST_STEP,
  readBookingDraft,
  STEP_COUNT,
  writeBookingDraft,
  type BookingDraft,
  type BookingStepIndex,
  type CustomerDraft,
} from "@/components/booking/booking-types";
import {
  StepDetails,
  type CustomerField,
} from "@/components/booking/steps/step-details";
import { StepDate } from "@/components/booking/steps/step-date";
import { StepReview } from "@/components/booking/steps/step-review";
import { StepService } from "@/components/booking/steps/step-service";
import { StepStaff } from "@/components/booking/steps/step-staff";
import { StepTime } from "@/components/booking/steps/step-time";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  getAvailableSlots,
  getBusinessNow,
  getEligibleStaff,
  toDateKey,
} from "@/lib/availability";
import { useDemoStore } from "@/lib/demo-store";
import { validateCustomer } from "@/lib/validation";

type TouchedFields = Partial<Record<CustomerField, boolean>>;
type FieldErrors = Partial<Record<CustomerField, string>>;

const CUSTOMER_FIELDS: CustomerField[] = ["name", "email", "phone"];

function resolveErrorStep(
  fieldErrors: Record<string, string> | undefined,
  fallback: BookingStepIndex,
): BookingStepIndex {
  const keys = Object.keys(fieldErrors ?? {});

  if (keys.includes("serviceId")) {
    return 0;
  }

  if (keys.includes("staffId")) {
    return 1;
  }

  if (keys.includes("time")) {
    return 3;
  }

  if (keys.some((key) => key.startsWith("customer"))) {
    return 4;
  }

  return fallback;
}

export function BookingFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    hydrated,
    services,
    staff,
    bookings,
    createBooking,
  } = useDemoStore();

  const [now] = useState<Date>(() => getBusinessNow());
  const [step, setStep] = useState<BookingStepIndex>(0);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [staffId, setStaffId] = useState<string | null>(null);
  const [dateKey, setDateKey] = useState<string | null>(null);
  const [slotStartAt, setSlotStartAt] = useState<string | null>(null);
  const [customer, setCustomer] = useState<CustomerDraft>(() => ({
    ...createEmptyDraft().customer,
  }));
  const [notes, setNotes] = useState("");
  const [touched, setTouched] = useState<TouchedFields>({});
  const [serverErrors, setServerErrors] = useState<FieldErrors>({});
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [draftReady, setDraftReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const restoredRef = useRef(false);
  const submittingRef = useRef(false);
  const focusHeadingRef = useRef(false);
  const appliedServiceParamRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (!hydrated || restoredRef.current) {
      return;
    }

    restoredRef.current = true;

    const stored = readBookingDraft();
    const draft = stored ?? createEmptyDraft();
    const todayKey = toDateKey(now);

    let nextServiceId = draft.serviceId;
    let nextStaffId = draft.staffId;
    let nextDateKey = draft.dateKey;
    let nextSlotStartAt = draft.slotStartAt;
    let nextStep = draft.step;

    const selectedService = nextServiceId
      ? services.find(
          (service) => service.id === nextServiceId && service.active,
        )
      : undefined;

    if (!selectedService) {
      nextServiceId = null;
      nextStaffId = null;
      nextDateKey = null;
      nextSlotStartAt = null;
      nextStep = 0;
    } else {
      if (nextStaffId) {
        const staffIsValid =
          nextStaffId === "any" ||
          getEligibleStaff(selectedService, staff).some(
            (member) => member.id === nextStaffId,
          );

        if (!staffIsValid) {
          nextStaffId = null;
          nextDateKey = null;
          nextSlotStartAt = null;
          nextStep = Math.min(nextStep, 1) as BookingStepIndex;
        }
      } else if (nextStep > 1) {
        nextStep = 1;
        nextDateKey = null;
        nextSlotStartAt = null;
      }

      if (
        nextStep > 2 &&
        (!nextDateKey ||
          !isValidDateKey(nextDateKey) ||
          nextDateKey < todayKey)
      ) {
        nextDateKey = null;
        nextSlotStartAt = null;
        nextStep = 2;
      }

      if (nextStep > 3 && !nextSlotStartAt) {
        nextStep = 3;
      }
    }

    const requestedServiceId = searchParams.get("service");
    const requestedService = requestedServiceId
      ? services.find(
          (service) =>
            service.id === requestedServiceId && service.active,
        )
      : undefined;

    const resolvedServiceId = requestedService
      ? requestedService.id
      : nextServiceId;
    const resolvedStaffId = requestedService ? null : nextStaffId;
    const resolvedDateKey = requestedService ? null : nextDateKey;
    const resolvedSlotStartAt = requestedService ? null : nextSlotStartAt;
    const resolvedStep = requestedService ? 0 : nextStep;

    appliedServiceParamRef.current = searchParams.get("service");

    startTransition(() => {
      setServiceId(resolvedServiceId);
      setStaffId(resolvedStaffId);
      setDateKey(resolvedDateKey);
      setSlotStartAt(resolvedSlotStartAt);
      setStep(resolvedStep);
      setCustomer({ ...draft.customer });
      setNotes(draft.notes);
      setDraftReady(true);
    });
  }, [hydrated, now, searchParams, services, staff]);

  useEffect(() => {
    if (!hydrated || !draftReady) {
      return;
    }

    const requestedServiceId = searchParams.get("service");

    if (appliedServiceParamRef.current === undefined) {
      appliedServiceParamRef.current = requestedServiceId;
      return;
    }

    if (requestedServiceId === appliedServiceParamRef.current) {
      return;
    }

    appliedServiceParamRef.current = requestedServiceId;

    if (!requestedServiceId) {
      return;
    }

    const requestedService = services.find(
      (service) => service.id === requestedServiceId && service.active,
    );

    if (!requestedService) {
      return;
    }

    startTransition(() => {
      setServiceId(requestedService.id);
      setStaffId(null);
      setDateKey(null);
      setSlotStartAt(null);
      setStep(0);
      setTouched({});
      setServerErrors({});
      setConfirmError(null);
    });
  }, [draftReady, hydrated, searchParams, services]);

  useEffect(() => {
    if (!draftReady) {
      return;
    }

    const hasContent =
      step > 0 ||
      Boolean(serviceId) ||
      Boolean(staffId) ||
      Boolean(dateKey) ||
      Boolean(slotStartAt) ||
      Boolean(customer.name) ||
      Boolean(customer.email) ||
      Boolean(customer.phone) ||
      Boolean(notes);

    if (!hasContent) {
      clearBookingDraft();
      return;
    }

    const draft: BookingDraft = {
      step,
      serviceId,
      staffId,
      dateKey,
      slotStartAt,
      customer,
      notes,
    };

    writeBookingDraft(draft);
  }, [
    customer,
    dateKey,
    draftReady,
    notes,
    serviceId,
    slotStartAt,
    staffId,
    step,
  ]);

  useEffect(() => {
    if (!focusHeadingRef.current) {
      return;
    }

    focusHeadingRef.current = false;
    const heading = document.getElementById("booking-step-heading");

    if (heading) {
      heading.focus();
      heading.scrollIntoView({ block: "start" });
    }
  }, [step]);

  const activeServices = useMemo(
    () => services.filter((service) => service.active),
    [services],
  );
  const service = serviceId
    ? activeServices.find((entry) => entry.id === serviceId)
    : undefined;

  useEffect(() => {
    if (!draftReady || !hydrated || !serviceId || service) {
      return;
    }

    startTransition(() => {
      setServiceId(null);
      setStaffId(null);
      setDateKey(null);
      setSlotStartAt(null);
      setStep(0);
    });
  }, [draftReady, hydrated, service, serviceId]);

  const eligibleStaff = useMemo(
    () => (service ? getEligibleStaff(service, staff) : []),
    [service, staff],
  );

  useEffect(() => {
    if (!draftReady || !service || !staffId || staffId === "any") {
      return;
    }

    if (!eligibleStaff.some((member) => member.id === staffId)) {
      startTransition(() => {
        setStaffId(null);
        setDateKey(null);
        setSlotStartAt(null);
        setStep(1);
      });
    }
  }, [draftReady, eligibleStaff, service, staffId]);

  const selectedStaff =
    staffId && staffId !== "any"
      ? eligibleStaff.find((member) => member.id === staffId)
      : undefined;

  const staffName =
    staffId === "any"
      ? "Any available professional"
      : selectedStaff?.name ?? "Not selected";

  const daySlots = useMemo(() => {
    if (!service || !staffId || !dateKey) {
      return [];
    }

    return getAvailableSlots({
      dateKey,
      service,
      staffId,
      staff,
      bookings,
      now,
    });
  }, [bookings, dateKey, now, service, staff, staffId]);

  const customerErrors = useMemo<FieldErrors>(() => {
    const raw = validateCustomer({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
    });
    const result: FieldErrors = {};

    if (raw.name) {
      result.name = raw.name;
    }

    if (raw.email) {
      result.email = raw.email;
    }

    if (raw.phone) {
      result.phone = raw.phone;
    }

    return result;
  }, [customer]);

  const detailsErrors = useMemo<FieldErrors>(() => {
    const result: FieldErrors = {};

    for (const field of CUSTOMER_FIELDS) {
      const error =
        serverErrors[field] ??
        (touched[field] ? customerErrors[field] : undefined);

      if (error) {
        result[field] = error;
      }
    }

    return result;
  }, [customerErrors, serverErrors, touched]);

  function isStepComplete(index: BookingStepIndex): boolean {
    switch (index) {
      case 0:
        return Boolean(service);
      case 1:
        return Boolean(
          staffId && (staffId === "any" || Boolean(selectedStaff)),
        );
      case 2:
        return Boolean(dateKey && daySlots.length > 0);
      case 3:
        return Boolean(
          slotStartAt &&
            daySlots.some(
              (slot) =>
                slot.startAt === slotStartAt &&
                (staffId === "any" || slot.staffIds.includes(staffId ?? "")),
            ),
        );
      case 4:
        return Object.keys(customerErrors).length === 0;
      case 5:
        return true;
      default:
        return false;
    }
  }

  function goToStep(next: BookingStepIndex) {
    focusHeadingRef.current = true;
    setStep(next);
  }

  function handleProgressSelect(next: BookingStepIndex) {
    if (next >= step) {
      return;
    }

    goToStep(next);
  }

  function handleSelectService(nextServiceId: string) {
    if (nextServiceId === serviceId) {
      return;
    }

    setServiceId(nextServiceId);
    setStaffId(null);
    setDateKey(null);
    setSlotStartAt(null);
    setConfirmError(null);
    setServerErrors({});
    setTouched({});
  }

  function handleSelectStaff(nextStaffId: string) {
    if (nextStaffId === staffId) {
      return;
    }

    setStaffId(nextStaffId);
    setDateKey(null);
    setSlotStartAt(null);
    setConfirmError(null);
  }

  function handleSelectDate(nextDateKey: string) {
    if (nextDateKey === dateKey) {
      return;
    }

    setDateKey(nextDateKey);
    setSlotStartAt(null);
    setConfirmError(null);
  }

  function handleSelectSlot(nextStartAt: string) {
    setSlotStartAt(nextStartAt);
    setConfirmError(null);
  }

  function handleJumpToDate(nextDateKey: string) {
    setDateKey(nextDateKey);
    setSlotStartAt(null);
    setConfirmError(null);
  }

  function handleCustomerChange(field: CustomerField, value: string) {
    setCustomer((current) => ({ ...current, [field]: value }));

    if (serverErrors[field]) {
      setServerErrors((current) => {
        const next = { ...current };
        delete next[field];
        return next;
      });
    }

    setConfirmError(null);
  }

  function handleCustomerBlur(field: CustomerField) {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  function handleNotesChange(value: string) {
    setNotes(value);
    setConfirmError(null);
  }

  function handleBack() {
    if (step === 0) {
      return;
    }

    goToStep((step - 1) as BookingStepIndex);
  }

  function handleContinue() {
    if (step === LAST_STEP) {
      return;
    }

    if (!isStepComplete(step)) {
      if (step === 4) {
        setTouched({ name: true, email: true, phone: true });
      }

      return;
    }

    goToStep((step + 1) as BookingStepIndex);
  }

  async function handleConfirm() {
    if (submittingRef.current) {
      return;
    }

    if (!service) {
      setConfirmError("Choose a service before confirming.");
      goToStep(0);
      return;
    }

    if (!staffId) {
      setConfirmError("Choose a professional before confirming.");
      goToStep(1);
      return;
    }

    if (!dateKey) {
      setConfirmError("Choose a date before confirming.");
      goToStep(2);
      return;
    }

    if (!slotStartAt) {
      setConfirmError("Choose a time before confirming.");
      goToStep(3);
      return;
    }

    const currentNow = getBusinessNow();
    const slots = getAvailableSlots({
      dateKey,
      service,
      staffId,
      staff,
      bookings,
      now: currentNow,
    });
    const slot = slots.find(
      (entry) =>
        entry.startAt === slotStartAt &&
        (staffId === "any" || entry.staffIds.includes(staffId)),
    );

    if (!slot) {
      setSlotStartAt(null);
      setServerErrors({});
      setConfirmError(
        "That time is no longer available. Choose another time to continue.",
      );
      goToStep(3);
      return;
    }

    const time = getBusinessTimeInput(slot.startAt);

    if (!time) {
      setConfirmError("That time could not be validated. Choose another time.");
      goToStep(3);
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setConfirmError(null);
    setServerErrors({});

    let succeeded = false;

    try {
      const result = createBooking({
        serviceId: service.id,
        staffId,
        dateKey,
        time,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        notes: notes.trim() || undefined,
      });

      if (!result.ok) {
        const fieldErrors = result.fieldErrors ?? {};
        const mapped: FieldErrors = {};

        if (fieldErrors.customerName) {
          mapped.name = fieldErrors.customerName;
        }

        if (fieldErrors.customerEmail) {
          mapped.email = fieldErrors.customerEmail;
        }

        if (fieldErrors.customerPhone) {
          mapped.phone = fieldErrors.customerPhone;
        }

        setServerErrors(mapped);
        setConfirmError(result.error);

        if (fieldErrors.time) {
          setSlotStartAt(null);
        }

        goToStep(resolveErrorStep(fieldErrors, step));
        return;
      }

      succeeded = true;
      clearBookingDraft();
      setServiceId(null);
      setStaffId(null);
      setDateKey(null);
      setSlotStartAt(null);
      setStep(0);
      setCustomer({ ...createEmptyDraft().customer });
      setNotes("");
      setTouched({});
      setServerErrors({});
      setConfirmError(null);
      submittingRef.current = false;
      setSubmitting(false);
      router.push(
        `/booking/success?ref=${encodeURIComponent(result.data.reference)}`,
      );
    } finally {
      if (!succeeded) {
        submittingRef.current = false;
        setSubmitting(false);
      }
    }
  }

  if (!hydrated || !draftReady) {
    return <BookingFlowSkeleton />;
  }

  const stepMeta = BOOKING_STEPS[step];
  const currentValid = isStepComplete(step);

  return (
    <div className="mt-8 space-y-6">
      <BookingProgress
        currentStep={step}
        onSelectStep={handleProgressSelect}
      />

      {confirmError ? (
        <Alert variant="danger" title="Could not complete the booking">
          {confirmError}
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <div className="space-y-1.5">
            <p className="text-caption font-medium uppercase tracking-[0.16em] text-ink-muted">
              Step {step + 1} of {STEP_COUNT}
            </p>
            <h2
              id="booking-step-heading"
              tabIndex={-1}
              className="text-2xl font-semibold tracking-[-0.01em] text-ink focus:outline-none"
            >
              {stepMeta.label}
            </h2>
            <p className="support-text text-ink-secondary">
              {stepMeta.description}
            </p>
          </div>

          <div className="mt-5">
            {step === 0 ? (
              <StepService
                services={activeServices}
                selectedServiceId={serviceId}
                onSelectService={handleSelectService}
              />
            ) : null}

            {step === 1 && service ? (
              <StepStaff
                eligibleStaff={eligibleStaff}
                services={services}
                selectedStaffId={staffId}
                onSelectStaff={handleSelectStaff}
                onChooseAnotherService={() => goToStep(0)}
              />
            ) : null}

            {step === 2 && service && staffId ? (
              <StepDate
                service={service}
                staffId={staffId}
                staff={staff}
                bookings={bookings}
                now={now}
                selectedDateKey={dateKey}
                onSelectDate={handleSelectDate}
                onGoToServices={() => goToStep(0)}
              />
            ) : null}

            {step === 3 && service && staffId && dateKey ? (
              <StepTime
                service={service}
                dateKey={dateKey}
                staffId={staffId}
                staff={staff}
                bookings={bookings}
                now={now}
                slots={daySlots}
                selectedStartAt={slotStartAt}
                onSelectSlot={handleSelectSlot}
                onChooseAnotherDate={() => goToStep(2)}
                onJumpToDate={handleJumpToDate}
              />
            ) : null}

            {step === 4 ? (
              <StepDetails
                customer={customer}
                notes={notes}
                errors={detailsErrors}
                onCustomerChange={handleCustomerChange}
                onNotesChange={handleNotesChange}
                onBlur={handleCustomerBlur}
              />
            ) : null}

            {step === 5 && service && dateKey && slotStartAt ? (
              <StepReview
                service={service}
                staffName={staffName}
                staff={selectedStaff ?? null}
                dateKey={dateKey}
                startAt={slotStartAt}
                customer={customer}
                notes={notes}
              />
            ) : null}
          </div>

          <div className="mt-8 hidden items-center justify-between gap-3 border-t border-line-subtle pt-5 lg:flex">
            <div>
              {step > 0 ? (
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  leftIcon={<ArrowLeftIcon size={16} aria-hidden="true" />}
                >
                  Back
                </Button>
              ) : (
                <span />
              )}
            </div>

            {step === LAST_STEP ? (
              <Button
                size="lg"
                onClick={handleConfirm}
                loading={submitting}
                disabled={submitting}
                leftIcon={<CheckCircleIcon size={18} aria-hidden="true" />}
              >
                Confirm booking
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={handleContinue}
                disabled={!currentValid}
                rightIcon={<ArrowRightIcon size={16} aria-hidden="true" />}
              >
                Continue
              </Button>
            )}
          </div>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <BookingSummary
              service={service}
              staffName={staffName}
              staff={selectedStaff ?? null}
              dateKey={dateKey}
              startAt={slotStartAt}
            />
            <p className="mt-3 px-1 text-caption text-ink-muted">
              Demo booking · Your details stay in this browser.
            </p>
          </div>
        </aside>
      </div>

      <div
        className="sticky bottom-0 z-20 -mx-4 mt-2 border-t border-line bg-app/95 px-4 pt-3 backdrop-blur md:-mx-6 lg:hidden"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
      >
        <div className="flex items-center gap-3">
          {step > 0 ? (
            <Button
              variant="secondary"
              onClick={handleBack}
              className="min-h-12 flex-1"
            >
              Back
            </Button>
          ) : null}

          {step === LAST_STEP ? (
            <Button
              size="lg"
              onClick={handleConfirm}
              loading={submitting}
              disabled={submitting}
              className="min-h-12 flex-1"
            >
              Confirm booking
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={handleContinue}
              disabled={!currentValid}
              className="min-h-12 flex-1"
            >
              Continue
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
