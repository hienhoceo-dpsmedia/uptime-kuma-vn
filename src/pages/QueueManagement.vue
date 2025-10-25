<template>
  <div class="container-fluid">
    <h1 class="mt-4 mb-4">Quản Lý Hàng Đợi (Queue Management)</h1>
    
    <div class="row">
      <!-- Queue Settings Panel -->
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-3">
              <i class="bi bi-gear-fill"></i> Cài Đặt Hàng Đợi
            </h5>
          </div>
          <div class="card-body">
            <div class="row mb-3">
              <div class="col-md-6">
                <label for="enabled" class="form-label">Bật/Tắt</label>
                <div class="form-check form-switch">
                  <input type="checkbox" id="queueEnabled" class="form-check-input" v-model="queueSettings.enabled">
                </div>
              </div>
              <div class="col-md-6">
                <label for="maxPerSecond" class="form-label">Tối đa (Tối giây)</label>
                <input type="number" id="maxPerSecond" class="form-control" min="1" max="100" v-model.number="queueSettings.maxPerSecond">
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-md-6">
                <label for="maxPerMinute" class="form-label">Tối đa (Tối phút)</label>
                <input type="number" id="maxPerMinute" class="form-control" min="1" max="10000" v-model.number="queueSettings.maxPerMinute">
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-md-6">
                <label for="maxPerHour" class="form-label">Tối đa (Tối giờ)</label>
                <input type="number" id="maxPerHour" class="form-control" min="1" max="100000" v-model.number="queueSettings.maxPerHour">
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-md-6">
                <label for="maxPerDay" class="form-label">Tối đa (Tối ngày)</label>
                <input type="number" id="maxPerDay" class="form-control" min="1" max="1000000" v-model.number="queueSettings.maxPerDay">
              </div>
            </div>
            <div class="mt-3">
              <button class="btn btn-primary" @click="saveQueueSettings">
                <i class="bi bi-check-lg"></i> Lưu Cài Đặt
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Queue Status Panel -->
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-3">
              <i class="bi bi-graph-up"></i> Trạng Thái Hàng Đợi (Queue Status)
            </h5>
          </div>
          <div class="card-body">
            <div class="text-center mb-3">
              <h6>Trạng thái hiện tại</h6>
              <div class="badge bg-success" style="display: inline-block; min-width: 120px;">
                <span v-if="queueStatus.queueLength">Đang chờ: {{ queueStatus.queueLength }}</span>
              </div>
              <div class="badge bg-warning" style="display: inline-block; min-width: 120px;">
                <span v-if="queueStatus.processing">Đang xử lý: {{ queueStatus.processing }}</span>
              </div>
              <div class="badge bg-danger" style="display: inline-block; min-width: 120px;">
                <span v-if="queueStatus.error">Lỗi: {{ queueStatus.error }}</span>
              </div>
              <div class="badge bg-secondary" style="display: inline-block; min-width: 120px;">
                <span v-if="queueStatus.idle">Nhàn rỗi: {{ queueStatus.idle }}</span>
              </div>
            </div>
            <div class="mt-3">
              <div class="row">
                <div class="col-md-6">
                  <strong>Tổng số monitor:</strong> {{ queueStatus.totalMonitors }}
                </div>
                <div class="col-md-6">
                  <strong>Đã kiểm (Đã kiểm) trong 1 giây:</strong> {{ queueStatus.checksIn1Hour }}
                </div>
              </div>
              <div class="progress mt-3" v-if="queueStatus.checksInProgress">
                <div class="progress-bar">
                  <div class="progress-bar-fill" :style="{ width: queueStatus.checkProgressPercentage + '%' }"></div>
                </div>
                <small class="text-muted">Đang xử lý (Đã xử lý): {{ queueStatus.checkProgressPercentage }}%</small>
              </div>
            </div>
          </div>
          <div class="text-center mt-3">
            <button class="btn btn-sm btn-outline-primary" @click="refreshQueueStatus">
              <i class="bi bi-arrow-clockwise"></i> Làm mới
            </button>
            </div>
          </div>
        </div>
      </div>
    
      <!-- CSV Import Panel -->
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-3">
              <i class="bi bi-file-earmark-fill"></i> Nhập Monitor từ CSV
            </h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <div class="custom-file-upload" @drop="handleFileDrop" @click="triggerFileInput">
                <div class="upload-icon">
                  <i class="bi bi-cloud-upload"></i>
                </div>
                <span class="upload-text" v-if="!csvFileName">Chọn hoặc kéo thả file CSV vào đây</span>
                <span class="upload-text" v-if="csvFileName">{{ csvFileName }}</span>
                <input type="file" id="csvFileInput" accept=".csv" style="display: none;" @change="handleFileSelect">
              </div>
            </div>
            </div>
            
            <div class="mb-3">
              <div class="row">
                <div class="col-md-6">
                  <label for="defaultInterval" class="form-label">Khoảng mặc định (giây):</label>
                  <input type="number" id="defaultInterval" class="form-control" value="60" min="20">
                </div>
                <div class="col-md-6">
                  <label for="defaultTimeout" class="form-label">Timeout mặc định (giây):</label>
                  <input type="number" id="defaultTimeout" class="form-control" value="30" min="1">
                </div>
              </div>
            </div>
            
            <div class="mb-3">
              <button class="btn btn-primary" @click="importCSV" :disabled="!csvFileName">
                <i class="bi bi-upload"></i> Nhập Monitor
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QueueManagement',
  data() {
    return {
      queueSettings: {
        enabled: true,
        maxPerSecond: 10,
        maxPerMinute: 100,
        maxPerHour: 1000,
        maxPerDay: 100000
      },
      queueStatus: {
        queueLength: 0,
        processing: false,
        error: null,
        checksIn1Hour: 0,
        checkProgressPercentage: 0
      }
    };
  },
  methods: {
    async fetchQueueStatus() {
      try {
        const response = await fetch('/api/queue/status', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.$root.getToken()}`
          }
        });
        
        if (response.ok) {
          this.queueStatus = await response.json();
        }
      } catch (error) {
        this.queueStatus = {
          processing: false,
          error: error.message
        };
      }
    },
    async saveQueueSettings() {
      try {
        const response = await fetch('/api/queue/settings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.$root.getToken()}`
          },
          body: JSON.stringify(this.queueSettings)
        });
        
        if (response.ok) {
          this.$root.toast('Cài đặt hàng đợi thành công!', 'success');
        }
      } catch (error) {
        this.$root.toast('Lỗi khi lưu cài đặt!', 'error');
      }
    },
    handleFileDrop(event) {
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      if (file) {
        this.csvFileName = file.name;
        this.csvFileData = null;
        
        // Read file content
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target.readyState === FileReader.DONE) {
            this.csvFileData = e.target.result;
          }
        };
        reader.readAsText(file);
      }
    },
    handleFileSelect(event) {
      event.preventDefault();
      const input = event.target;
      input.click();
    },
    triggerFileInput() {
      const input = document.getElementById('csvFileInput');
      input.click();
    },
    async importCSV() {
      if (!this.csvFileName) {
        this.$root.toast('Vui lòng chọn file CSV!', 'warning');
        return;
      }
      
      try {
        const formData = new FormData();
        formData.append('csvFile', this.csvFileData);
        
        const response = await fetch('/api/import/monitors', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.$root.getToken()}`
          },
          body: formData
        });
        
        if (response.ok) {
          const result = await response.json();
          this.$root.toast(`Nhập thành công ${result.imported} monitor!`, 'success');
        } else {
          this.$root.toast(`Lỗi: ${result.errors?.length || 0} monitor!`, 'error');
        }
      } catch (error) {
        this.$root.toast('Lỗi khi nhập monitor!', 'error');
      }
    },
    async refreshQueueStatus() {
      this.queueStatus.processing = true;
      await this.fetchQueueStatus();
      
      setTimeout(() => {
        this.queueStatus.processing = false;
        await this.fetchQueueStatus();
      }, 2000);
    }
  },
  mounted() {
    this.fetchQueueStatus();
    }
};
</script>

<style scoped>
.card {
  transition: all 0.3s ease;
  box-shadow: 0 0.125rem 0 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem;
  border-radius: 0.5rem 0.5rem 0 0;
}

.card-body {
  padding: 1.5rem;
}

.form-label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.5rem;
  display: block;
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  background-color: #fff;
}

.form-check {
  position: relative;
  display: inline-block;
  width: 20px;
  height: 20px;
  margin-right: 0.5rem;
  top: 2px;
}

.form-check-input {
  appearance: none;
  width: 20px;
  height: 20px;
  position: absolute;
  opacity: 0;
}

.custom-file-upload {
  border: 2px dashed #007bff;
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-icon {
  font-size: 2rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
}

.upload-text {
  font-size: 0.875rem;
  color: #495057;
  margin-bottom: 0.5rem;
}

.btn {
  transition: all 0.3s ease;
}

.progress-bar {
  height: 20px;
  background: #e9ecef;
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
}

.progress-bar-fill {
  height: 20px;
  background: linear-gradient(90deg, #28a745, #667eea);
  transition: width 0.3s ease;
}

.badge {
  display: inline-block;
  min-width: 120px;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-weight: bold;
  text-align: center;
}

.bg-success { background-color: #28a745 !important; }
.bg-warning { background-color: #ffc107 !important; }
.bg-danger { background-color: #dc3545 !important; }
.bg-secondary { background-color: #6c757d !important; }

.text-center { text-align: center; }
.text-muted { color: #6c757d; }

.mt-3 { margin-top: 1rem !important; }
.mb-3 { margin-bottom: 1rem !important; }
.mt-4 { margin-top: 1.5rem !important; }
.mt-6 { margin-top: 3rem !important; }

.progress {
  margin-bottom: 0.5rem;
}
</style>
