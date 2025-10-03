import re
import math
import requests
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import openai
import os

class AIValuationEngine:
    """
    Advanced AI-powered domain valuation engine using multiple algorithms
    and machine learning models to provide accurate domain pricing
    """
    
    def __init__(self):
        self.openai_client = openai.OpenAI()
        
        # Domain quality scoring weights
        self.scoring_weights = {
            'length': 0.15,
            'memorability': 0.20,
            'brandability': 0.25,
            'seo_potential': 0.15,
            'extension_value': 0.10,
            'market_trends': 0.15
        }
        
        # TLD value multipliers
        self.tld_multipliers = {
            'com': 1.0,
            'net': 0.3,
            'org': 0.25,
            'io': 0.8,
            'ai': 1.2,
            'xyz': 0.15,
            'app': 0.6,
            'dev': 0.7,
            'tech': 0.5,
            'crypto': 1.5,
            'nft': 1.3,
            'web3': 1.4,
            'dao': 1.1,
            'defi': 1.6
        }
        
        # High-value keywords
        self.premium_keywords = {
            'crypto', 'bitcoin', 'ethereum', 'blockchain', 'nft', 'defi', 'web3',
            'metaverse', 'ai', 'ml', 'tech', 'app', 'cloud', 'data', 'finance',
            'bank', 'pay', 'money', 'invest', 'trade', 'market', 'shop', 'store',
            'game', 'play', 'social', 'media', 'news', 'health', 'medical'
        }
    
    async def comprehensive_valuation(self, domain_name: str, 
                                    additional_data: Optional[Dict] = None) -> Dict:
        """
        Perform comprehensive AI-powered domain valuation
        
        Args:
            domain_name: Domain name to evaluate
            additional_data: Additional context data
            
        Returns:
            Comprehensive valuation report
        """
        parts = domain_name.split('.')
        sld = '.'.join(parts[:-1]).lower()
        tld = parts[-1].lower()
        
        # Core scoring components
        length_score = self._calculate_length_score(sld)
        memorability_score = await self._calculate_memorability_score(sld)
        brandability_score = await self._calculate_brandability_score(sld)
        seo_score = await self._calculate_seo_potential(sld)
        extension_score = self._calculate_extension_value(tld)
        market_score = await self._calculate_market_trends(sld, tld)
        
        # Calculate weighted overall score
        overall_score = (
            length_score * self.scoring_weights['length'] +
            memorability_score * self.scoring_weights['memorability'] +
            brandability_score * self.scoring_weights['brandability'] +
            seo_score * self.scoring_weights['seo_potential'] +
            extension_score * self.scoring_weights['extension_value'] +
            market_score * self.scoring_weights['market_trends']
        )
        
        # Calculate base value and apply multipliers
        base_value = self._score_to_value(overall_score)
        tld_multiplier = self.tld_multipliers.get(tld, 0.1)
        estimated_value = base_value * tld_multiplier
        
        # Apply premium keyword bonuses
        keyword_bonus = self._calculate_keyword_bonus(sld)
        estimated_value *= (1 + keyword_bonus)
        
        # Get comparable sales data
        comparables = await self._get_comparable_sales(sld, tld)
        
        # AI-powered market analysis
        market_analysis = await self._ai_market_analysis(domain_name, estimated_value)
        
        return {
            'domain_name': domain_name,
            'estimated_value': round(estimated_value, 2),
            'confidence_score': min(95, max(60, overall_score * 100)),
            'valuation_breakdown': {
                'length_score': length_score,
                'memorability_score': memorability_score,
                'brandability_score': brandability_score,
                'seo_potential': seo_score,
                'extension_value': extension_score,
                'market_trends': market_score,
                'overall_score': overall_score
            },
            'value_drivers': self._identify_value_drivers(sld, tld),
            'comparable_sales': comparables,
            'market_analysis': market_analysis,
            'investment_recommendation': self._generate_investment_recommendation(
                estimated_value, overall_score, market_analysis
            ),
            'valuation_date': datetime.utcnow().isoformat()
        }
    
    def _calculate_length_score(self, sld: str) -> float:
        """Calculate score based on domain length"""
        length = len(sld)
        
        if length <= 3:
            return 1.0  # Premium short domains
        elif length <= 6:
            return 0.9  # Very good
        elif length <= 10:
            return 0.7  # Good
        elif length <= 15:
            return 0.5  # Average
        else:
            return 0.2  # Poor
    
    async def _calculate_memorability_score(self, sld: str) -> float:
        """Calculate memorability using AI analysis"""
        try:
            prompt = f"""
            Rate the memorability of the domain name "{sld}" on a scale of 0.0 to 1.0.
            Consider factors like:
            - Ease of pronunciation
            - Spelling simplicity
            - Pattern recognition
            - Phonetic appeal
            
            Respond with only a number between 0.0 and 1.0.
            """
            
            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=10,
                temperature=0.3
            )
            
            score_text = response.choices[0].message.content.strip()
            return float(score_text)
            
        except Exception:
            # Fallback to heuristic scoring
            return self._heuristic_memorability_score(sld)
    
    def _heuristic_memorability_score(self, sld: str) -> float:
        """Fallback heuristic memorability scoring"""
        score = 0.5  # Base score
        
        # Bonus for common patterns
        if re.match(r'^[a-z]+$', sld):  # Only letters
            score += 0.2
        
        # Penalty for numbers and hyphens
        if re.search(r'[0-9]', sld):
            score -= 0.1
        if '-' in sld:
            score -= 0.15
        
        # Bonus for vowel-consonant patterns
        vowels = len(re.findall(r'[aeiou]', sld))
        consonants = len(sld) - vowels
        if vowels > 0 and consonants > 0:
            ratio = min(vowels, consonants) / max(vowels, consonants)
            score += ratio * 0.2
        
        return max(0.0, min(1.0, score))
    
    async def _calculate_brandability_score(self, sld: str) -> float:
        """Calculate brandability potential using AI"""
        try:
            prompt = f"""
            Evaluate the brandability potential of "{sld}" as a business name.
            Consider:
            - Uniqueness and distinctiveness
            - Professional appeal
            - Industry versatility
            - Trademark potential
            - Global appeal
            
            Rate from 0.0 to 1.0. Respond with only the number.
            """
            
            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=10,
                temperature=0.3
            )
            
            score_text = response.choices[0].message.content.strip()
            return float(score_text)
            
        except Exception:
            return self._heuristic_brandability_score(sld)
    
    def _heuristic_brandability_score(self, sld: str) -> float:
        """Fallback brandability scoring"""
        score = 0.5
        
        # Bonus for unique combinations
        if not any(word in sld for word in ['the', 'and', 'for', 'with']):
            score += 0.1
        
        # Bonus for made-up words that sound professional
        if len(sld) >= 5 and not re.search(r'[0-9]', sld):
            score += 0.2
        
        # Penalty for generic terms
        generic_terms = ['site', 'web', 'online', 'digital', 'service']
        if any(term in sld for term in generic_terms):
            score -= 0.2
        
        return max(0.0, min(1.0, score))
    
    async def _calculate_seo_potential(self, sld: str) -> float:
        """Calculate SEO potential"""
        score = 0.5
        
        # Bonus for keyword-rich domains
        if any(keyword in sld for keyword in self.premium_keywords):
            score += 0.3
        
        # Bonus for exact match potential
        if len(sld.split()) == 1 and len(sld) <= 12:
            score += 0.2
        
        # Check for search volume (simplified)
        if await self._has_search_volume(sld):
            score += 0.2
        
        return min(1.0, score)
    
    async def _has_search_volume(self, term: str) -> bool:
        """Check if term has search volume (simplified implementation)"""
        # In production, this would integrate with Google Keyword Planner API
        # For now, use heuristics
        return len(term) >= 3 and any(keyword in term for keyword in self.premium_keywords)
    
    def _calculate_extension_value(self, tld: str) -> float:
        """Calculate TLD value score"""
        base_score = 0.5
        multiplier = self.tld_multipliers.get(tld, 0.1)
        return min(1.0, base_score + (multiplier - 0.5))
    
    async def _calculate_market_trends(self, sld: str, tld: str) -> float:
        """Calculate market trends score using AI analysis"""
        try:
            prompt = f"""
            Analyze current market trends for domains like "{sld}.{tld}".
            Consider:
            - Industry growth trends
            - Technology adoption
            - Investment interest
            - Future potential
            
            Rate market attractiveness from 0.0 to 1.0. Respond with only the number.
            """
            
            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=10,
                temperature=0.3
            )
            
            score_text = response.choices[0].message.content.strip()
            return float(score_text)
            
        except Exception:
            return self._heuristic_market_score(sld, tld)
    
    def _heuristic_market_score(self, sld: str, tld: str) -> float:
        """Fallback market trends scoring"""
        score = 0.5
        
        # Bonus for trending technologies
        trending_terms = ['ai', 'ml', 'crypto', 'nft', 'web3', 'metaverse', 'defi']
        if any(term in sld for term in trending_terms):
            score += 0.3
        
        # Bonus for premium TLDs
        if tld in ['com', 'io', 'ai']:
            score += 0.2
        
        return min(1.0, score)
    
    def _score_to_value(self, score: float) -> float:
        """Convert overall score to base monetary value"""
        # Exponential scaling for domain values
        if score >= 0.9:
            return 50000 + (score - 0.9) * 500000  # $50K - $100K+
        elif score >= 0.8:
            return 10000 + (score - 0.8) * 400000  # $10K - $50K
        elif score >= 0.7:
            return 2000 + (score - 0.7) * 80000   # $2K - $10K
        elif score >= 0.6:
            return 500 + (score - 0.6) * 15000    # $500 - $2K
        elif score >= 0.5:
            return 100 + (score - 0.5) * 4000     # $100 - $500
        else:
            return 10 + score * 180                # $10 - $100
    
    def _calculate_keyword_bonus(self, sld: str) -> float:
        """Calculate bonus for premium keywords"""
        bonus = 0.0
        
        for keyword in self.premium_keywords:
            if keyword in sld:
                if sld == keyword:  # Exact match
                    bonus += 0.5
                else:  # Partial match
                    bonus += 0.2
        
        return min(1.0, bonus)  # Cap at 100% bonus
    
    async def _get_comparable_sales(self, sld: str, tld: str) -> List[Dict]:
        """Get comparable domain sales data"""
        # In production, this would query domain sales databases
        # For now, return mock data based on patterns
        
        comparables = []
        
        # Generate similar domain patterns
        similar_patterns = [
            f"{sld[:3]}*",
            f"*{sld[-3:]}",
            f"{sld}*",
            f"*{tld}"
        ]
        
        for i, pattern in enumerate(similar_patterns[:3]):
            comparables.append({
                'domain': f"example{i+1}.{tld}",
                'sale_price': self._generate_comparable_price(sld, tld),
                'sale_date': (datetime.now() - timedelta(days=30*i)).isoformat(),
                'pattern_match': pattern,
                'relevance_score': 0.8 - (i * 0.2)
            })
        
        return comparables
    
    def _generate_comparable_price(self, sld: str, tld: str) -> float:
        """Generate realistic comparable prices"""
        base_score = (len(sld) / 10) + self.tld_multipliers.get(tld, 0.1)
        base_price = self._score_to_value(base_score)
        
        # Add some randomness for realism
        import random
        variation = random.uniform(0.7, 1.3)
        return round(base_price * variation, 2)
    
    async def _ai_market_analysis(self, domain_name: str, estimated_value: float) -> Dict:
        """Generate AI-powered market analysis"""
        try:
            prompt = f"""
            Provide a brief market analysis for the domain "{domain_name}" valued at ${estimated_value:,.2f}.
            Include:
            1. Market positioning (1-2 sentences)
            2. Target buyer profile (1-2 sentences)
            3. Investment outlook (1-2 sentences)
            
            Keep response under 200 words.
            """
            
            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=200,
                temperature=0.7
            )
            
            analysis_text = response.choices[0].message.content.strip()
            
            return {
                'analysis': analysis_text,
                'market_segment': self._determine_market_segment(domain_name),
                'liquidity_score': self._calculate_liquidity_score(estimated_value),
                'risk_level': self._assess_risk_level(estimated_value)
            }
            
        except Exception:
            return self._fallback_market_analysis(domain_name, estimated_value)
    
    def _fallback_market_analysis(self, domain_name: str, estimated_value: float) -> Dict:
        """Fallback market analysis"""
        return {
            'analysis': f"Domain {domain_name} shows potential in the current market with an estimated value of ${estimated_value:,.2f}. Market conditions favor domains with strong brandability and SEO potential.",
            'market_segment': self._determine_market_segment(domain_name),
            'liquidity_score': self._calculate_liquidity_score(estimated_value),
            'risk_level': self._assess_risk_level(estimated_value)
        }
    
    def _determine_market_segment(self, domain_name: str) -> str:
        """Determine market segment for domain"""
        sld = domain_name.split('.')[0].lower()
        
        if any(term in sld for term in ['crypto', 'bitcoin', 'ethereum', 'defi', 'nft']):
            return 'Cryptocurrency & Blockchain'
        elif any(term in sld for term in ['ai', 'ml', 'tech', 'app', 'software']):
            return 'Technology & Software'
        elif any(term in sld for term in ['finance', 'bank', 'pay', 'invest']):
            return 'Financial Services'
        elif any(term in sld for term in ['health', 'medical', 'care']):
            return 'Healthcare & Medical'
        elif any(term in sld for term in ['game', 'play', 'entertainment']):
            return 'Gaming & Entertainment'
        else:
            return 'General Business'
    
    def _calculate_liquidity_score(self, estimated_value: float) -> float:
        """Calculate domain liquidity score"""
        if estimated_value >= 10000:
            return 0.9  # High-value domains have good liquidity
        elif estimated_value >= 1000:
            return 0.7  # Medium liquidity
        elif estimated_value >= 100:
            return 0.5  # Average liquidity
        else:
            return 0.3  # Lower liquidity
    
    def _assess_risk_level(self, estimated_value: float) -> str:
        """Assess investment risk level"""
        if estimated_value >= 50000:
            return 'High Risk, High Reward'
        elif estimated_value >= 5000:
            return 'Medium Risk'
        elif estimated_value >= 500:
            return 'Low-Medium Risk'
        else:
            return 'Low Risk'
    
    def _identify_value_drivers(self, sld: str, tld: str) -> List[str]:
        """Identify key value drivers for the domain"""
        drivers = []
        
        if len(sld) <= 6:
            drivers.append('Short length premium')
        
        if any(keyword in sld for keyword in self.premium_keywords):
            drivers.append('Premium keyword inclusion')
        
        if tld in ['com', 'io', 'ai']:
            drivers.append('Premium TLD extension')
        
        if re.match(r'^[a-z]+$', sld):
            drivers.append('Clean alphabetic composition')
        
        if not re.search(r'[0-9-]', sld):
            drivers.append('No numbers or hyphens')
        
        return drivers
    
    def _generate_investment_recommendation(self, estimated_value: float, 
                                          overall_score: float, 
                                          market_analysis: Dict) -> Dict:
        """Generate investment recommendation"""
        if overall_score >= 0.8 and estimated_value >= 5000:
            recommendation = 'Strong Buy'
            reasoning = 'High-quality domain with excellent fundamentals and strong market potential.'
        elif overall_score >= 0.7 and estimated_value >= 1000:
            recommendation = 'Buy'
            reasoning = 'Good domain with solid fundamentals and reasonable market potential.'
        elif overall_score >= 0.6:
            recommendation = 'Hold/Consider'
            reasoning = 'Average domain with moderate potential. Consider market timing.'
        else:
            recommendation = 'Pass'
            reasoning = 'Below-average domain with limited investment potential.'
        
        return {
            'recommendation': recommendation,
            'reasoning': reasoning,
            'confidence': min(95, max(60, overall_score * 100)),
            'target_price_range': {
                'low': estimated_value * 0.8,
                'high': estimated_value * 1.2
            }
        }

