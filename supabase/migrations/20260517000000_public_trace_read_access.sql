-- Allow anonymous (unauthenticated) users to read trace products and events.
-- Required for the consumer-facing QR verification page at /trace/:batchId.
-- Producers intentionally make their supply chain data publicly verifiable.

CREATE POLICY "anon_can_view_trace_products" ON public.trace_products
  FOR SELECT TO anon USING (true);

CREATE POLICY "anon_can_view_trace_events" ON public.trace_events
  FOR SELECT TO anon USING (true);
