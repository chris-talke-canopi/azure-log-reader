<template>
    <section id="main" class="bg-white bg-clip-border drop-shadow-xl border mx-4 mb-4">
        <table class="w-full text-sm text-left text-gray-500">
            <thead class="text-xs text-gray-700 bg-gray-50">
                <tr>
                    <th scope="col" class="px-4 py-3 w-fit">Timestamp (Local)</th>
                    <th scope="col" class="px-4 py-3 w-fit">Message</th>
                </tr>
            </thead>
            <tbody v-if="logs.length > 0">
                <tr class="border-b text-sm/[12px]" v-for="log in logs" :key="log[4]">
                    <td class="px-4 py-2 w-fit">
                        {{ new Date(log[0]).toLocaleDateString() }} @ {{ new Date(log[0]).toLocaleTimeString() }}
                    </td>
                    <td class="px-4 py-2 w-fit">{{ log[3] }}</td>
                </tr>
            </tbody>
        </table>
    </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from 'vue-router';

import { api } from "../api";

const props = defineProps({
    setIsLoading: {
        type: Function,
    }
})

const route = useRoute();
const logs = ref([] as string[][]);

onMounted(async () => {
    props.setIsLoading(true);
    const { tenantId, operationId } = route.params as { tenantId?: string, operationId?: string };
    const logRes = await api.getLogs(tenantId, operationId);
    if (logRes && logRes.tables && logRes.tables.length > 0) {
        logs.value = logRes.tables[0].rows;
    }
    props.setIsLoading(false);
})
</script>

<style scoped>

</style>