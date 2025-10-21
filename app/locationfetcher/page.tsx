'use client';

import { useState, useEffect, useRef } from 'react';
import type { ApplicationContext } from '@sitecore-marketplace-sdk/client';
import { useMarketplaceClient } from '../utils/hooks/useMarketplaceClient';
import { ApiError } from 'next/dist/server/api-utils';


interface LocationResult {
  locationID: string;
  locationName: string;
}

interface PageContextResponse {
  data?: {
    pageInfo?: {
      id?: string;
    };
  };
}

interface LocationResponse {
  locationCount: number;
  locationResults: LocationResult[];
}

export default function LocationFetcher() {
  const { client, error, isInitialized } = useMarketplaceClient();
  const [appContext, setAppContext] = useState<ApplicationContext>();
  const [searchQuery, setSearchQuery] = useState('');
  const [locations, setLocations] = useState<LocationResult[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<LocationResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!error && isInitialized && client) {
      console.log('Marketplace client initialized successfully.');

      
      // Make a query to retrieve the application context
      client
        .query('pages.context')
        .then((res) => {
          console.log('Success retrieving pages.context:', res.data?.pageInfo?.id);
          //setAppContext(res.data);
        })
        .catch((error) => {
          console.error('Error retrieving pages.context:', error);
        });
    } else if (error) {
      console.error('Error initializing Marketplace client:', error);
    }
  }, [client, error, isInitialized]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter locations based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredLocations([]);
      setShowDropdown(false);
      return;
    }

    const filtered = locations.filter((location) =>
      location.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.locationID.includes(searchQuery)
    );

    setFilteredLocations(filtered);
    setShowDropdown(filtered.length > 0);
  }, [searchQuery, locations]);

  // Fetch locations from API
  const fetchLocations = async (query: string) => {
    if (query.trim().length < 2) return;

    setIsLoading(true);

    try {
      
      // TEMPORARY MOCK DATA - Remove this when you have a real API
      const mockData: LocationResponse = {
        locationCount: 3,
        locationResults: [
          {
            locationID: "9584",
            locationName: "Baylor Scott & White Family Health Center - Richardson"
          },
          {
            locationID: "9585",
            locationName: "Baylor Scott & White Medical Center - Dallas"
          },
          {
            locationID: "9586",
            locationName: "Baylor Scott & White Family Health Center - Plano"
          }
        ]
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Filter mock data based on query
      const filtered = mockData.locationResults.filter(loc =>
        loc.locationName.toLowerCase().includes(query.toLowerCase())
      );
      
      setLocations(filtered);
    } catch (err) {
      console.error('Error fetching locations:', err);
      setLocations([]);
    } finally {
      setIsLoading(false);
    }
  };


  const updateFields = (data: string) => {
    if (client) {
      client
        .query('pages.context')
        .then(async (res: PageContextResponse) => {
          const pageId = res.data?.pageInfo?.id;
          console.log('Page Info:', pageId);

          // Example: update the Sitecore item title
          if (pageId && searchQuery) {
            console.log('updateSitecoreItemField api is called', location);
            await fetch('/api/update-sitecore-field', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                itemId: pageId,
                fieldName: 'title',
                fieldValue: `${data}`,
              }),
            });
            client.closeApp();
          }
        })
        .catch((error: ApiError) => {
          console.error('Error retrieving pages.context:', error);
        });
    }
  };

  // Handle search input change with debouncing
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSelectedLocation(null);

    // Debounce API calls
    const timeoutId = setTimeout(() => {
      fetchLocations(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleLocationSelect = async (location: LocationResult) => {
    setSelectedLocation(location);
    setSearchQuery(location.locationName);
    setShowDropdown(false);
    
    // Save the location ID to the client
    if (client) {
      try {
        await client.setValue(location.locationID, true);
        console.log('Location ID saved:', location.locationID);
        client.closeApp();
      } catch (error) {
        console.error('Error saving location ID:', error);
      }
    }
  };

  return (
    <>
      <h1>Welcome to {appContext?.name}</h1>
      
      <div style={{ maxWidth: '600px', margin: '20px auto' }}>
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <label htmlFor="location-search" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Search Location
          </label>
          <input
            id="location-search"
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by location name, type, or ID..."
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              border: '2px solid #ccc',
              borderRadius: '8px',
              outline: 'none',
              transition: 'border-color 0.3s',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#007bff';
              filteredLocations.length > 0 && setShowDropdown(true);
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#ccc';
            }}
          />
          
          {isLoading && (
            <div style={{
              position: 'absolute',
              right: '12px',
              top: '42px',
              fontSize: '14px',
              color: '#666'
            }}>
              Loading...
            </div>
          )}

          {showDropdown && filteredLocations.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '8px',
                marginTop: '4px',
                maxHeight: '300px',
                overflowY: 'auto',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                zIndex: 1000,
              }}
            >
              {filteredLocations.map((location) => (
                <div
                  key={location.locationID}
                  onClick={() => handleLocationSelect(location)}
                  style={{
                    padding: '12px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f0f0f0',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                    {location.locationName}
                  </div>
                 
                </div>
              ))}
            </div>
          )}

          {searchQuery.length > 0 && !isLoading && filteredLocations.length === 0 && (
            <div style={{
              marginTop: '8px',
              padding: '12px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              color: '#666',
              fontSize: '14px'
            }}>
              No locations found. Try a different search term.
            </div>
          )}
        </div>

        {selectedLocation && (
          <div style={{
            marginTop: '20px',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '12px' }}>Selected Location</h3>
            <p><strong>Name:</strong> {selectedLocation.locationName}</p>
            
            <p><strong>Location ID:</strong> {selectedLocation.locationID}</p>
            
          </div>
        )}
      </div>

    
    </>
  );
}
