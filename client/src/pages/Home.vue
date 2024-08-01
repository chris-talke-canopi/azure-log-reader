<template>
    <div class="mx-4">
        <div v-if="tenants.length">
            <section id="main" class="bg-white bg-clip-border drop-shadow-xl border">
                <table class="w-full text-sm text-left text-gray-500">
                    <thead class="text-xs text-gray-700 bg-gray-50">
                        <tr>
                            <th scope="col" class="px-4 py-3">Name</th>
                            <th scope="col" class="px-4 py-3">Version</th>
                            <th scope="col" class="px-4 py-3">Id</th>
                            <th scope="col" class="px-4 py-3">API Key</th>
                        </tr>
                    </thead>
                    <tbody v-if="tenants.length > 0">
                        <tr class="border-b text-sm/[12px]" v-for="tenant in tenants" :key="tenant.id">
                            <td class="px-4 py-3">
                                <RouterLink class="underline text-blue-700" :to="`/tenant/${tenant.id}`">{{ tenant.name }}</RouterLink>
                            </td>
                            <td class="px-4 py-3">{{ tenant.tenant_version }}</td>
                            <td class="px-4 py-3">{{ tenant.tenant_id }}</td>
                            <td class="px-4 py-3">{{ tenant.tenant_key }}</td>
                        </tr>
                    </tbody>
                </table>
            </section>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router'

import { Tenant } from '../../../types';
import { api } from '../api';

const props = defineProps({
    setIsLoading: {
        type: Function,
    }
})

const tenants = ref([] as Tenant[]);

onMounted(async function () {
    props.setIsLoading(true);
    const tenant_data = await api.getTenants();
    if (tenant_data) {
        tenants.value = tenant_data;
    }
    props.setIsLoading(false);
})

</script>

<style scoped></style>