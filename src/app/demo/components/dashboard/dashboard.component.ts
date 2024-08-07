import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Product } from '../../api/product';
import { ProductService } from '../../service/product.service';
import { Subscription, debounceTime } from 'rxjs';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx';
import * as Papa from 'papaparse';
import { AuthService,DataItem  } from '../auth/auth.service';
@Component({
    templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
    groupedData: any[] = [];
    years: any[] = [];
    familles: any[] = [];
    filteredFamilles: any[] = [];
    searchQuery: string = '';
    months: number[] = [];
    selectedYear: string = ''
    selectedFamille: string = '';
    selectedMonth: string = '';
    familleSearch: string = '';
    isLoading = true;
    monthNames: string[] = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    rawData: any[] = [];

    items!: MenuItem[];

    products!: Product[];

    chartData: any;

    chartOptions: any;

    subscription!: Subscription;

    constructor(private productService: ProductService, public layoutService: LayoutService,private http: HttpClient,private authService: AuthService) {


        this.subscription = this.layoutService.configUpdate$
        .pipe(debounceTime(25))
        .subscribe((config) => {
            this.initChart();
        });
    }

    ngOnInit() {

        this.loadOptions();
        this.loadChart();
        this.authService.getGroupedData().subscribe(
            response => {
              this.groupedData = response;
            },
            error => {
              console.error('Error fetching grouped data', error);
            }
          );
        this.authService.getFamilles()
        this.initChart();
        this.productService.getProductsSmall().then(data => this.products = data);

        this.items = [
            { label: 'Add New', icon: 'pi pi-fw pi-plus' },
            { label: 'Remove', icon: 'pi pi-fw pi-minus' }
        ];
    }
    initChart() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        const filteredData = this.rawData.filter(item => item.Famille === this.selectedFamille || !this.selectedFamille);
    const dates = Array.from(new Set(filteredData.map(item => item.Date)));
    const quantities = dates.map(date => {
      const totalQty = filteredData.filter(item => item.Date === date)
                                   .reduce((sum, item) => sum + item.Qte, 0);
      return totalQty;
    });
        this.chartData = {
            labels: ["January", "February", "March", "April", "May", "June", 
                            "July", "August", "September", "October", "November", "December"],
            datasets: [
              {
                label: 'Quantity',
                data: quantities,
                fill: false,
                backgroundColor: '#42A5F5',
                borderColor: '#42A5F5',
                tension: .4
              }
            ]
          };

          this.chartOptions = {
            responsive: true,
            plugins: {
              legend: {
                display: true
              },
              tooltip: {
                callbacks: {
                  label: (tooltipItem) => `Quantity: ${tooltipItem.raw}`
                }
              }
            }
          };
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    loadOptions(): void {
        // Fetch years and familles from the backend
        this.http.get<any[]>('http://127.0.0.1:5000/get_years').subscribe(data => {
          this.years = data;
        });
    
        this.http.get<any[]>('http://127.0.0.1:5000/familles').subscribe(data => {
          this.familles = data;
          this.filteredFamilles = data;
        });
        this.http.get<any[]>('http://127.0.0.1:5000/get_months').subscribe(data => {
          this.months = data;
        });
      }
      loadChart(): void {  
        // Convert selectedYear to number if it's not already
        const year = Number(this.selectedYear);
        const month = Number(this.selectedMonth);
        this.authService.getQuantityByMonth(this.selectedFamille,year,month);
      }
      onYearChange(year: any): void {
        this.selectedYear = year;
        this.loadChart();
      }
    
      onFamilleChange(famille: any): void {
        this.selectedFamille = famille;
        this.loadChart();
      }
      onMonthChange(month: any): void {
        this.selectedMonth = month;
        this.loadChart();
      }
      filterFamilles(): void {
        const query = this.searchQuery.toLowerCase();
        console.log('Search Query:', query); // Debugging log
        this.filteredFamilles = this.familles.filter(famille =>
            famille.toLowerCase().startsWith(query)
        );
        console.log('Filtered Families:', this.filteredFamilles); // Debugging log
    }   
    

    loadFamilles() {
        this.http.get<string[]>('http://localhost:5000/familles').subscribe(data => {
          this.familles = data;
          this.filteredFamilles = data;
        });
      }
      loadData() {
        this.http.get<any[]>('http://localhost:5000/grouped_data').subscribe(data => {
          this.rawData = data;
          this.updateChart();
        });
      }
    //   onFamilleChange(event) {
    //     this.selectedFamille = event.target.value;
    //     this.authService.getGroupedData();  // Load data whenever the selected family changes
    //   } 
      updateChart() {
        if (!this.selectedFamille || Number(this.selectedYear) ===0 || Number(this.selectedMonth) === 0) {
          return;
        }
    
        const filteredData = this.rawData.filter(item => item.Famille === this.selectedFamille);
        
        const monthNames = ["January", "February", "March", "April", "May", "June", 
                            "July", "August", "September", "October", "November", "December"];
        
        const monthlyData = Array(12).fill(0);  // Initialize array to hold quantities for each month
    
        filteredData.forEach(item => {
          const date = new Date(item.Date);
          const month = date.getMonth();  // Get month index (0-11)
          monthlyData[month] += item.Qte; // Sum quantities by month
        });
        this.chartData = {
          labels: monthNames,
          datasets: [
            {
              label: `Quantity for ${this.selectedFamille}`,
              data: monthlyData,
              fill: false,
              backgroundColor: '#42A5F5',
              borderColor: '#42A5F5',
              tension: .4
            }
          ]
        };
    
        this.chartOptions = {
          responsive: true,
          plugins: {
            legend: {
              display: true
            },
            tooltip: {
              callbacks: {
                label: (tooltipItem) => `Quantity: ${tooltipItem.raw}`
              }
            }
          }
        };
      } 
}
