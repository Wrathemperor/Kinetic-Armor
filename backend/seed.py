import os
import random
import uuid
from datetime import datetime, timedelta
from app import app, db, Organization, Asset, Violation, SystemConfig

def seed():
    with app.app_context():
        # Ensure org exists
        org = Organization.query.first()
        if not org:
            org = Organization(name="Kinetic Test Org", api_key="test-api-key")
            db.session.add(org)
            db.session.commit()

        # Generate some dummy assets
        assets = []
        asset_names = [
            "cyber_samurai_concept.png",
            "neon_cityscape_final.psd",
            "character_model_rig_v2.blend",
            "ui_kit_brutalist_2026.fig",
            "marketing_hero_banner.jpg",
            "unreleased_product_render.png"
        ]
        
        for name in asset_names:
            phash = uuid.uuid4().hex[:16] # Fake 64-bit hex hash
            asset = Asset(
                org_id=org.id,
                file_path=os.path.join(os.path.abspath(os.path.dirname(__file__)), "uploads", name),
                phash=phash,
                created_at=datetime.utcnow() - timedelta(days=random.randint(10, 30))
            )
            db.session.add(asset)
            assets.append(asset)
            
        db.session.commit()

        # Generate violations for these assets
        platforms = [
            "https://twitter.com/stealer/status",
            "https://reddit.com/r/conceptart/comments",
            "https://pinterest.com/pin",
            "https://artstation-clone.net/post",
            "https://sketchy-merch-store.com/product",
            "https://tiktok.com/@reposter/video",
            "https://instagram.com/p",
            "https://opensea.io/assets/ethereum"
        ]
        
        # Add 25 violations
        for _ in range(25):
            asset = random.choice(assets)
            # Weighted towards higher severity to make the charts look dramatic
            severity = random.choices(
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 
                weights=[1, 1, 2, 2, 3, 4, 3, 4, 5, 2]
            )[0]
            
            if severity >= 8:
                context = random.choice(["COMMERCIAL MISUSE", "UNAUTHORIZED NFT MINT"])
            elif severity <= 3:
                context = random.choice(["FAN ART", "UNCREDITED REPOST"])
            else:
                context = random.choice(["AI TRAINING DATASET", "MODIFIED REPOST", "UNCREDITED REPOST"])
                
            platform_url = random.choice(platforms) + f"/{uuid.uuid4().hex[:8]}"
            
            violation = Violation(
                asset_id=asset.id,
                found_url=platform_url,
                found_image_path=f"violation_{uuid.uuid4().hex[:8]}.jpg",
                severity=severity,
                status="open",
                context=context,
                draft_dmca="Draft DMCA notice automatically generated and pending review...",
                created_at=datetime.utcnow() - timedelta(hours=random.randint(1, 168))
            )
            db.session.add(violation)
            
        db.session.commit()
        print("Database seeded successfully with dummy assets and violations!")

if __name__ == '__main__':
    seed()
