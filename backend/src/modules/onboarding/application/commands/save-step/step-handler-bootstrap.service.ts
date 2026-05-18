import { Injectable, OnModuleInit } from '@nestjs/common';
import { StepHandlerRegistry } from './step-handler.registry';
import { ClientAddressHandler } from './handlers/client-address.handler';
import { ClientPreferencesHandler } from './handlers/client-preferences.handler';
import { ContractorBusinessBasicsHandler } from './handlers/contractor-business-basics.handler';
import { ContractorServiceHandler } from './handlers/contractor-service.handler';
import { PortfolioItemHandler } from './handlers/portfolio-item.handler';
import { DocumentUploadHandler } from './handlers/document-upload.handler';
import { PayoutAccountHandler } from './handlers/payout-account.handler';
import { QuotationTemplateHandler } from './handlers/quotation-template.handler';
import { SupplierProfilePatchHandler } from './handlers/supplier-profile-patch.handler';
import { ProductHandler } from './handlers/product.handler';
import { DeliverySettingHandler } from './handlers/delivery-setting.handler';
import { JobSeekerProfilePatchHandler } from './handlers/job-seeker-profile-patch.handler';
import { CoverImageHandler } from './handlers/cover-image.handler';

@Injectable()
export class StepHandlerBootstrapService implements OnModuleInit {
  constructor(
    private readonly registry: StepHandlerRegistry,
    private readonly clientAddress: ClientAddressHandler,
    private readonly clientPreferences: ClientPreferencesHandler,
    private readonly contractorBusinessBasics: ContractorBusinessBasicsHandler,
    private readonly contractorService: ContractorServiceHandler,
    private readonly portfolioItem: PortfolioItemHandler,
    private readonly documentUpload: DocumentUploadHandler,
    private readonly payoutAccount: PayoutAccountHandler,
    private readonly quotationTemplate: QuotationTemplateHandler,
    private readonly supplierProfilePatch: SupplierProfilePatchHandler,
    private readonly product: ProductHandler,
    private readonly deliverySetting: DeliverySettingHandler,
    private readonly jobSeekerProfilePatch: JobSeekerProfilePatchHandler,
    private readonly coverImage: CoverImageHandler,
  ) {}

  onModuleInit(): void {
    this.registry.register('client.address', this.clientAddress);
    this.registry.register('client.preferences', this.clientPreferences);
    this.registry.register('contractor.business_basics', this.contractorBusinessBasics);
    this.registry.register('contractor.first_service', this.contractorService);
    this.registry.register('contractor.service_details', this.contractorService);
    this.registry.register('*.portfolio', this.portfolioItem);
    this.registry.register('*.verification', this.documentUpload);
    this.registry.register('*.license', this.documentUpload);
    this.registry.register('*.certificates', this.documentUpload);
    this.registry.register('*.tax', this.documentUpload);
    this.registry.register('*.clearances', this.documentUpload);
    this.registry.register('*.recommendations', this.documentUpload);
    this.registry.register('contractor.payout', this.payoutAccount);
    this.registry.register('supplier.payout', this.payoutAccount);
    this.registry.register('contractor.quotation_templates', this.quotationTemplate);
    this.registry.register('supplier.store_identity', this.supplierProfilePatch);
    this.registry.register('supplier.store_details', this.supplierProfilePatch);
    this.registry.register('supplier.business_registration', this.supplierProfilePatch);
    this.registry.register('supplier.first_product', this.product);
    this.registry.register('supplier.product_details', this.product);
    this.registry.register('supplier.inventory', this.product);
    this.registry.register('supplier.pricing_extras', this.product);
    this.registry.register('supplier.delivery', this.deliverySetting);
    this.registry.register('jobseeker.skills', this.jobSeekerProfilePatch);
    this.registry.register('jobseeker.profile', this.jobSeekerProfilePatch);
    this.registry.register('jobseeker.preferences', this.jobSeekerProfilePatch);
    this.registry.register('jobseeker.tools', this.jobSeekerProfilePatch);
    this.registry.register('jobseeker.work_history', this.jobSeekerProfilePatch);
    this.registry.register('*.cover', this.coverImage);
  }
}
