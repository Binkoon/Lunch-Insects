<template>
  <div class="modern-calendar">
    <!-- 캘린더 헤더 -->
    <CalendarHeader 
      :current-month-text="currentMonthText"
      :actual-members="actualMembers"
      @prev-month="prevMonth"
      @next-month="nextMonth"
    />

    <!-- 캘린더 그리드 -->
    <CalendarGrid
      :calendar-days="calendarDays"
      :current-date="currentDate"
      :selected-day="selectedDay"
      :member-statuses="memberStatuses"
      :actual-members="actualMembers"
      :restaurants="restaurants"
      :proposals="proposals"
      :current-user="currentUser"
      @day-click="handleDayClick"
      @restaurant-click="handleRestaurantClick"
      @proposal-click="handleProposalClick"
      @proposal-accept="handleProposalAccept"
      @proposal-reject="handleProposalReject"
      @proposal-create="handleProposalCreate"
      @proposal-delete="handleProposalDelete"
      @proposal-moved="handleProposalMoved"
      @drag-start="handleDragStart"
      @drag-end="handleDragEnd"
    />

    <!-- 제안 모달 -->
    <ProposalSystem
      v-if="showProposalModal"
      :proposal="selectedProposal"
      :current-user="currentUser"
      :actual-members="actualMembers"
      @close="closeProposalModal"
      @vote="handleProposalVote"
      @confirmed="handleProposalConfirmed"
      @moved="handleProposalMoved"
    />

    <!-- 음식점 상세 모달 -->
    <RestaurantDetailModal
      v-if="showRestaurantDetailModal"
      :restaurant="selectedRestaurantDetail"
      :date="selectedRestaurantDate"
      :members="getRestaurantMembers(selectedRestaurantDetail, selectedRestaurantDate)"
      :current-user="currentUser"
      @close="closeRestaurantDetailModal"
    />
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { useCalendar } from '@/composables/useCalendar'
import CalendarHeader from './CalendarHeader.vue'
import CalendarGrid from './CalendarGrid.vue'
import ProposalSystem from './ProposalSystem.vue'
import RestaurantDetailModal from './RestaurantDetailModal.vue'

export default defineComponent({
  name: 'GroupCalendar',
  components: {
    CalendarHeader,
    CalendarGrid,
    ProposalSystem,
    RestaurantDetailModal
  },
  props: {
    groupId: {
      type: String,
      required: true
    },
    members: {
      type: Array,
      default: () => []
    }
  },
  emits: [
    'open-status-modal',
    'open-restaurant-modal'
  ],
  setup(props, { emit }) {
    // useCalendar에서 모든 로직 가져오기
    const calendarLogic = useCalendar(props, emit)

    return {
      ...calendarLogic
    }
  }
})
</script>

<style scoped>
.modern-calendar {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 24px;
  margin: 16px 0;
  min-height: 600px;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .modern-calendar {
    padding: 16px;
    margin: 8px 0;
    border-radius: 12px;
  }
}
</style>
