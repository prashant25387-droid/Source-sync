import { CropListing, BuyerRequirement } from '../types';

export interface MatchResult {
  listing: CropListing;
  overallScore: number; // 0 to 100
  cropScore: number;     // max 30
  quantityScore: number; // max 20
  timingScore: number;   // max 20
  priceScore: number;    // max 15
  locationScore: number; // max 15
  explanation: string;
  isEligible: boolean;
}

export class MarketplaceService {
  public calculateMatch(listing: CropListing, req: BuyerRequirement): MatchResult {
    // 1. Crop Compatibility (30 pts) - Hard constraint
    let cropScore = 0;
    const reqCropClean = req.cropName.trim().toLowerCase();
    const listingCropClean = listing.cropName.trim().toLowerCase();

    if (listingCropClean.includes(reqCropClean) || reqCropClean.includes(listingCropClean)) {
      cropScore = 30;
    } else {
      return {
        listing,
        overallScore: 0,
        cropScore: 0,
        quantityScore: 0,
        timingScore: 0,
        priceScore: 0,
        locationScore: 0,
        explanation: 'Different crop variety (Incompatible)',
        isEligible: false,
      };
    }

    // 2. Quantity Compatibility (20 pts)
    let quantityScore = 0;
    if (listing.quantityAvailable >= req.quantity) {
      quantityScore = 20; // Fully satisfies quantity
    } else if (listing.quantityAvailable >= req.quantity * 0.5) {
      // Partial volume (at least 50%)
      const ratio = listing.quantityAvailable / req.quantity;
      quantityScore = Math.round(ratio * 20);
    } else {
      quantityScore = 5;
    }

    // 3. Harvest Timing (20 pts)
    let timingScore = 15; // default reasonable window
    if (req.requiredDate && listing.expectedHarvestDate) {
      const listingMonth = new Date(listing.expectedHarvestDate).getMonth();
      const reqMonth = new Date(req.requiredDate).getMonth();
      const monthDiff = Math.abs(listingMonth - reqMonth);
      if (monthDiff === 0) timingScore = 20;
      else if (monthDiff === 1) timingScore = 14;
      else if (monthDiff === 2) timingScore = 8;
      else timingScore = 0;
    }

    // 4. Price Compatibility (15 pts)
    let priceScore = 0;
    if (req.targetPrice > 0) {
      if (listing.expectedPrice <= req.targetPrice) {
        priceScore = 15; // Price is at or below target
      } else {
        const premiumPercent = ((listing.expectedPrice - req.targetPrice) / req.targetPrice) * 100;
        if (premiumPercent <= 10) priceScore = 10;
        else if (premiumPercent <= 20) priceScore = 5;
        else priceScore = 0;
      }
    } else {
      priceScore = 10; // Neutral if no target price specified
    }

    // 5. Location Compatibility (15 pts)
    let locationScore = 5;
    if (req.location && listing.generalLocation) {
      const reqLoc = req.location.toLowerCase();
      const listLoc = listing.generalLocation.toLowerCase();
      if (listLoc.includes(reqLoc) || reqLoc.includes(listLoc)) {
        locationScore = 15;
      } else {
        locationScore = 8; // Interstate supply possible
      }
    }

    const total = cropScore + quantityScore + timingScore + priceScore + locationScore;
    const overallScore = Math.min(100, Math.max(0, total));

    let explanation = '';
    if (overallScore >= 80) {
      explanation = 'Strong match: requested crop, expected harvest window, and quantity are highly compatible.';
    } else if (overallScore >= 60) {
      explanation = 'Good match: crop and timing align well; minor adjustment needed on price or lot size.';
    } else {
      explanation = 'Moderate match: partial alignment on delivery timing or available lot volume.';
    }

    // Passport score threshold check if required by buyer
    const isEligible = !req.minPassportScore || listing.passportScore >= req.minPassportScore;

    return {
      listing,
      overallScore,
      cropScore,
      quantityScore,
      timingScore,
      priceScore,
      locationScore,
      explanation,
      isEligible,
    };
  }

  public findMatchesForRequirement(
    listings: CropListing[],
    req: BuyerRequirement
  ): MatchResult[] {
    return listings
      .map(listing => this.calculateMatch(listing, req))
      .filter(m => m.overallScore > 0 && m.isEligible)
      .sort((a, b) => b.overallScore - a.overallScore);
  }
}

export const marketplaceService = new MarketplaceService();
