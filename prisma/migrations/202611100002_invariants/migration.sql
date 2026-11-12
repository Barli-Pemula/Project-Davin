ALTER TABLE "Account" ADD CONSTRAINT "account_owner_kind" CHECK (
 ("kind"='USER_WALLET' AND "userId" IS NOT NULL AND "cooperativeId" IS NULL AND "offeringId" IS NULL) OR
 ("kind"='COOP_WALLET' AND "userId" IS NULL AND "cooperativeId" IS NOT NULL AND "offeringId" IS NULL) OR
 ("kind"='OFFERING_ESCROW' AND "userId" IS NULL AND "cooperativeId" IS NULL AND "offeringId" IS NOT NULL) OR
 ("kind"='DEMO_CLEARING' AND "userId" IS NULL AND "cooperativeId" IS NULL AND "offeringId" IS NULL));
ALTER TABLE "Account" ADD CONSTRAINT "nonnegative_balance" CHECK ("kind"='DEMO_CLEARING' OR "balance">=0);
ALTER TABLE "Offering" ADD CONSTRAINT "offering_amounts" CHECK ("target">0 AND "unitPrice">0 AND "target"%"unitPrice"=0 AND "raised">=0 AND "raised"<="target" AND "closesAt">="opensAt");
ALTER TABLE "Subscription" ADD CONSTRAINT "subscription_amount" CHECK ("amount">=50000 AND "unitPrice">0 AND "units">0 AND "amount"="unitPrice"*"units" AND "riskAccepted"=true);
ALTER TABLE "Agreement" ADD CONSTRAINT "agreement_shares" CHECK ("coopBps">=0 AND "fisherBps">=0 AND "coopBps"+"fisherBps"=10000);
ALTER TABLE "Prospectus" ADD CONSTRAINT "prospectus_payout" CHECK ("payoutBps">=0 AND "payoutBps"<=10000);
ALTER TABLE "Stage" ADD CONSTRAINT "stage_amount" CHECK ("amount">0 AND "number">0);
ALTER TABLE "JournalLine" ADD CONSTRAINT "journal_line_nonzero" CHECK ("amount"<>0);
ALTER TABLE "Document" ADD CONSTRAINT "document_context" CHECK (("kind"='KYC' AND "projectId" IS NULL AND "reportId" IS NULL) OR ("kind"='PROJECT' AND "projectId" IS NOT NULL AND "reportId" IS NULL) OR ("kind"='REPORT' AND "projectId" IS NULL AND "reportId" IS NOT NULL));
ALTER TABLE "Document" ADD CONSTRAINT "document_size" CHECK ("size">0 AND "size"<=2097152);

CREATE FUNCTION check_balanced_journal() RETURNS TRIGGER AS $$
DECLARE net NUMERIC; line_count INTEGER;
BEGIN
 SELECT COALESCE(SUM("amount"),0),COUNT(*) INTO net,line_count FROM "JournalLine" WHERE "journalId"=NEW."id";
 IF net<>0 OR line_count<2 THEN RAISE EXCEPTION 'Unbalanced journal'; END IF;
 RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE CONSTRAINT TRIGGER journal_balanced AFTER INSERT ON "Journal" DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION check_balanced_journal();
CREATE FUNCTION immutable_record() RETURNS TRIGGER AS $$
BEGIN RAISE EXCEPTION 'Append-only record'; END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER immutable_journal BEFORE UPDATE OR DELETE ON "Journal" FOR EACH ROW EXECUTE FUNCTION immutable_record();
CREATE TRIGGER immutable_journal_line BEFORE UPDATE OR DELETE ON "JournalLine" FOR EACH ROW EXECUTE FUNCTION immutable_record();
CREATE TRIGGER immutable_audit BEFORE UPDATE OR DELETE ON "Audit" FOR EACH ROW EXECUTE FUNCTION immutable_record();
